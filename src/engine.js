import {
  WipegramError,
  humanError,
  isAbortError,
  isAlreadyGoneError,
  isFatalError,
  isSearchFallbackError,
  isSkippedDeleteError,
  isTransientError,
  normalizeError,
  parseFloodWait
} from './errors.js';
import {
  localMatches,
  isOwnMessage,
  messagePreview,
  mtFilterForType
} from './filters.js';
import { PAGE_SIZE } from './telegram.js';
import { chunk, sleep } from './util.js';

/** Conservative batch size shared by all distributions. */
export const DELETE_BATCH_SIZE = 100;

/** Never silently park the UI for longer than this. */
export const MAX_FLOOD_WAIT_SECONDS = 15 * 60;

/** Extra flood pauses tolerated for one request before giving up. */
const MAX_FLOOD_RETRIES = 8;

/** Transient (network/5xx) retries tolerated for one request. */
const MAX_TRANSIENT_RETRIES = 3;

/** Hard stop for a runaway pagination loop. */
const MAX_SCAN_PAGES = 50_000;

function floodWaitError(seconds) {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return new WipegramError(
    'FLOOD_TOO_LONG',
    `Telegram asked Wipegram to pause for ${minutes} minute${minutes === 1 ? '' : 's'}. Stop here and try again later.`,
    { fatal: true, details: { seconds } }
  );
}

function aggregate(stats) {
  return {
    ...stats,
    attempted: stats.deleted + stats.alreadyGone + stats.skipped + stats.failed,
    finishedAt: Date.now()
  };
}

function failureRecord(message, error) {
  return {
    id: message.id,
    date: message.date ? message.date * 1000 : null,
    preview: messagePreview(message),
    code: error?.code || 'UNKNOWN',
    error: humanError(error)
  };
}

/**
 * Scan and delete orchestration. The engine knows nothing about the DOM: it
 * talks to a TelegramApi-like adapter, emits plain event objects for the UI and
 * accepts an AbortSignal for cancellation.
 */
export class WipegramEngine {
  constructor({
    api,
    onEvent = () => {},
    sleeper = sleep,
    batchSize = DELETE_BATCH_SIZE,
    pageSize = PAGE_SIZE,
    retryDelay = 1_000
  } = {}) {
    if (!api) throw new Error('WipegramEngine requires an api adapter');
    this.api = api;
    this.onEvent = onEvent;
    this.sleeper = sleeper;
    this.batchSize = Math.max(1, Math.min(DELETE_BATCH_SIZE, batchSize));
    this.pageSize = Math.max(1, Math.min(100, pageSize));
    this.retryDelay = Math.max(0, retryDelay);
  }

  emit(type, data = {}) {
    this.onEvent({ type, time: Date.now(), ...data });
  }

  checkAbort(signal) {
    if (signal?.aborted) throw normalizeError(new DOMException('Stopped', 'AbortError'));
  }

  /**
   * Retry one API call. Flood waits are honoured with a sleep and reported to
   * the UI; network/5xx errors get exponential backoff. Fatal Telegram errors
   * bubble up immediately.
   */
  async retry(fn, { signal, label = 'request', attempts = MAX_TRANSIENT_RETRIES, counter } = {}) {
    let transient = 0;
    let floods = 0;

    for (;;) {
      this.checkAbort(signal);

      try {
        return await fn();
      } catch (rawError) {
        const error = normalizeError(rawError);
        if (isAbortError(error)) throw error;

        if (error.fatal || isFatalError(error)) throw error;

        const wait = parseFloodWait(error);
        if (wait > 0) {
          if (wait > MAX_FLOOD_WAIT_SECONDS) throw floodWaitError(wait);
          if (++floods > MAX_FLOOD_RETRIES) {
            throw new WipegramError(
              'FLOOD_TOO_LONG',
              'Telegram keeps rate-limiting this request. Stop here and try again later.',
              { fatal: true }
            );
          }

          if (counter) {
            counter.count += 1;
            counter.seconds += wait;
          }

          this.emit('flood', {
            seconds: wait,
            until: Date.now() + wait * 1000,
            label
          });

          await this.sleeper(wait * 1000, signal);
          continue;
        }

        if (isTransientError(error) && transient < attempts) {
          transient += 1;
          const delay = Math.min(this.retryDelay * 2 ** (transient - 1), 30_000);
          this.emit('retry', {
            delay,
            attempt: transient,
            label,
            message: humanError(error)
          });
          await this.sleeper(delay, signal);
          continue;
        }

        throw error;
      }
    }
  }

  async fetchPinnedIds(target, signal, floodCounter) {
    try {
      return await this.retry(() => this.api.getPinnedIds({ target, signal }), {
        signal,
        label: 'load pinned messages',
        attempts: 1,
        counter: floodCounter
      });
    } catch (rawError) {
      const error = normalizeError(rawError);
      if (isAbortError(error) || error.fatal || isFatalError(error)) throw error;

      throw new WipegramError(
        'PINNED_UNAVAILABLE',
        'Pinned messages could not be loaded, so Wipegram stopped to protect them. Uncheck “Skip pinned messages” to scan anyway.',
        { cause: error, details: { type: error.code || error.type } }
      );
    }
  }

  /**
   * Find the user's own messages in the current target.
   *
   * Search mode asks Telegram for sender=me with the chosen server-side media
   * filter. Auto mode also verifies history from its newest page because an
   * empty or partial search result is not proof that no messages remain.
   */
  async scan({ target, filters, signal }) {
    if (!target) throw new WipegramError('NO_CHAT', 'Open a chat first, then press Scan messages.');
    if (!filters) throw new WipegramError('INVALID_FILTER', 'No filters were provided.');
    this.validateScope(target, filters);

    const startedAt = Date.now();
    const floodCounter = { count: 0, seconds: 0 };
    const matched = new Map();
    const limit = filters.maxMessages || 0;
    const explicitMode = filters.scanMethod || 'auto';
    let mode = explicitMode === 'history' || filters.includeOthers ? 'history' : 'search';
    let allowFallback = explicitMode === 'auto' && !filters.includeOthers;
    let offsetId = 0;
    let pages = 0;
    let scanned = 0;
    let inspected = 0;
    const checkedIds = new Set();
    let totalFound = 0;
    const seenCursors = new Set();
    const switchToHistory = (type, details = {}) => {
      allowFallback = false;
      mode = 'history';
      offsetId = 0;
      seenCursors.clear();
      this.emit(type, { ...details, matched: matched.size });
    };

    this.emit('scan:start', { target, filters, mode });

    const pinnedIds = filters.skipPinned
      ? await this.fetchPinnedIds(target, signal, floodCounter)
      : new Set();

    try {
      for (;;) {
        this.checkAbort(signal);
        if (pages >= MAX_SCAN_PAGES) {
          throw new WipegramError('SCAN_LIMIT', 'Wipegram reached its scan safety limit. Narrow the filters and try again.');
        }

        let page;
        try {
          page = mode === 'search'
            ? await this.retry(() => this.api.searchPage({
              target,
              query: filters.query,
              filter: mtFilterForType(filters.type),
              minDate: filters.minDate,
              maxDate: filters.maxDate,
              offsetId,
              limit: this.pageSize
            }), {
              signal,
              label: 'search messages',
              counter: floodCounter
            })
            : await this.retry(() => this.api.historyPage({
              target,
              offsetId,
              offsetDate: 0,
              limit: this.pageSize
            }), {
              signal,
              label: 'read chat history',
              counter: floodCounter
            });
        } catch (rawError) {
          const error = normalizeError(rawError);

          if (allowFallback && isSearchFallbackError(error)) {
            switchToHistory('scan:fallback', {
              reason: humanError(error),
              code: error.code || 'SEARCH_UNAVAILABLE'
            });
            continue;
          }

          throw error;
        }

        this.checkAbort(signal);
        pages += 1;
        if (page.notModified || page.incomplete) {
          if (allowFallback) {
            switchToHistory('scan:fallback', {
              reason: 'Telegram returned an incomplete search response.',
              code: 'INCOMPLETE_RESPONSE'
            });
            continue;
          }
          throw new WipegramError('INCOMPLETE_RESPONSE', 'Telegram did not return a complete message page. Scan again before deleting.');
        }
        const messages = page.messages || [];
        if (page.count && (mode === 'search' || filters.includeOthers)) totalFound = Math.max(totalFound, page.count);
        inspected += page.receivedCount ?? messages.length;

        let oldestMs = 0;
        for (const message of messages) {
          if (!Number.isInteger(message?.id) || message.id <= 0) continue;
          if (message.date) {
            const ms = message.date * 1000;
            if (!oldestMs || ms < oldestMs) oldestMs = ms;
          }

          if (message._ === 'message' && (filters.includeOthers || isOwnMessage(message, target.selfId))) {
            checkedIds.add(message.id);
            scanned = checkedIds.size;
          }

          if (matched.has(message.id)) continue;
          if (!localMatches(message, filters, {
            mode,
            pinnedIds,
            selfUserId: target.selfId
          })) continue;

          matched.set(message.id, message);
          if (limit && matched.size >= limit) break;
        }

        this.emit('scan:progress', {
          mode,
          pages,
          scanned,
          inspected,
          matched: matched.size,
          total: totalFound,
          oldestDate: oldestMs || null
        });

        if (limit && matched.size >= limit) break;
        const ids = messages.map(message => message?.id).filter(id => Number.isInteger(id) && id > 0);
        const nextOffset = page.nextOffsetId ?? (ids.length ? Math.min(...ids) : 0);
        const reachedMinDate = filters.minDate && oldestMs && oldestMs < filters.minDate;
        const stalled = nextOffset && ((offsetId && nextOffset >= offsetId) || seenCursors.has(nextOffset));
        if (!nextOffset || reachedMinDate || stalled) {
          if (allowFallback) {
            switchToHistory('scan:verify', { reason: 'Checking chat history for messages missing from sender search.' });
            continue;
          }
          if (stalled && mode === 'history' && !reachedMinDate) {
            throw new WipegramError('PAGINATION_STALLED', 'Telegram repeated a history page. The scan is incomplete; try again before deleting.');
          }
          break;
        }
        seenCursors.add(nextOffset);
        offsetId = nextOffset;

        if (filters.searchDelay) {
          await this.sleeper(filters.searchDelay, signal);
        }
      }
    } catch (rawError) {
      const error = normalizeError(rawError);
      if (isAbortError(error)) {
        this.emit('scan:aborted', { scanned, matched: matched.size, pages });
      }
      throw error;
    }

    const entries = [...matched.values()].sort((a, b) => b.id - a.id);
    const stats = {
      mode,
      pages,
      scanned,
      inspected,
      matched: entries.length,
      totalFound,
      floodWaits: floodCounter.count,
      floodSeconds: floodCounter.seconds,
      durationMs: Date.now() - startedAt,
      startedAt,
      finishedAt: Date.now()
    };

    this.emit('scan:done', { target, mode, entries, stats });
    return { mode, entries, stats };
  }

  /**
   * Delete scanned messages in batches of 100. A failed batch is retried one
   * message at a time so one forbidden/expired message cannot block the rest.
   *
   * Returns partial statistics instead of throwing for expected operational
   * failures, so the UI can always show what happened. Abort and Telegram flood
   * limits are reported in `stats.stopped` / `stats.error`.
   */
  validateScope(target, filters) {
    if ((filters.includeOthers !== undefined && typeof filters.includeOthers !== 'boolean')
      || (target.includeOthers !== undefined && typeof target.includeOthers !== 'boolean')
      || (filters.includeOthers === true) !== (target.includeOthers === true)
      || (filters.includeOthers === true && target.canDeleteOthers !== true)) {
      throw new WipegramError('MODERATION_FORBIDDEN', 'Message scope changed or admin permission is unavailable. Scan again.', { fatal: true });
    }
  }

  validateCandidates(target, filters, entries) {
    this.validateScope(target, filters);
    if (entries.some(message => message?._ !== 'message' || (!filters.includeOthers && !isOwnMessage(message, target.selfId)))) {
      throw new WipegramError('INVALID_CANDIDATE', 'A deletion candidate is outside the confirmed message scope. Scan again.', { fatal: true });
    }
  }

  async delete({ target, entries, filters = {}, signal }) {
    if (!target) throw new WipegramError('NO_CHAT', 'Open a chat and scan before deleting.');
    this.validateCandidates(target, filters, entries || []);
    const startedAt = Date.now();
    const floodCounter = { count: 0, seconds: 0 };
    const unique = [...new Map((entries || [])
      .filter(message => Number.isInteger(message?.id) && message.id > 0)
      .map(message => [message.id, message])).values()];

    const stats = {
      total: unique.length,
      deleted: 0,
      alreadyGone: 0,
      skipped: 0,
      failed: 0,
      processed: 0,
      batches: 0,
      failedBatches: 0,
      floodWaits: 0,
      floodSeconds: 0,
      stopped: false,
      error: null,
      startedAt,
      durationMs: 0
    };
    const failures = [];

    this.emit('delete:start', { target, total: unique.length });

    if (!unique.length) {
      const finished = aggregate(stats);
      this.emit('delete:done', { stats: finished, failures });
      return { stats: finished, failures };
    }

    const emitProgress = (current = null) => {
      stats.processed = stats.deleted + stats.alreadyGone + stats.skipped + stats.failed;
      this.emit('delete:progress', {
        total: unique.length,
        processed: stats.processed,
        deleted: stats.deleted,
        alreadyGone: stats.alreadyGone,
        skipped: stats.skipped,
        failed: stats.failed,
        current
      });
    };

    try {
      // Pins may have changed while the user reviewed the scan.
      const pinnedIds = filters.skipPinned
        ? await this.fetchPinnedIds(target, signal, floodCounter)
        : new Set();
      const eligible = unique.filter(message => {
        if (filters.skipPinned && (message.pFlags?.pinned || pinnedIds.has(message.id))) {
          stats.skipped += 1;
          failures.push(failureRecord(message, new WipegramError('PINNED_MESSAGE', 'Message is pinned and was protected.')));
          return false;
        }
        return true;
      });
      emitProgress();
      const batches = chunk(eligible, this.batchSize);

      for (const batch of batches) {
        this.checkAbort(signal);
        stats.batches += 1;

        let batchFailed = false;
        try {
          await this.retry(() => {
            this.validateCandidates(target, filters, batch);
            return this.api.deleteBatch({ target, ids: batch.map(message => message.id) });
          }, {
            signal,
            label: `delete batch (${batch.length} messages)`,
            counter: floodCounter
          });

          stats.deleted += batch.length;
          emitProgress(batch[batch.length - 1]);
        } catch (rawError) {
          const error = normalizeError(rawError);
          if (isAbortError(error) || error.fatal || error.code === 'FLOOD_TOO_LONG') throw error;

          batchFailed = true;
          stats.failedBatches += 1;
          this.emit('delete:warning', {
            message: `A batch of ${batch.length} messages was rejected. Retrying one by one.`,
            error: humanError(error),
            code: error.code || 'BATCH_REJECTED'
          });
        }

        if (batchFailed) {
          for (const message of batch) {
            this.checkAbort(signal);

            try {
              await this.retry(() => {
                this.validateCandidates(target, filters, [message]);
                return this.api.deleteBatch({ target, ids: [message.id] });
              }, {
                signal,
                label: `delete message ${message.id}`,
                attempts: 1,
                counter: floodCounter
              });

              stats.deleted += 1;
            } catch (rawError) {
              const error = normalizeError(rawError);
              if (isAbortError(error) || error.fatal || error.code === 'FLOOD_TOO_LONG') throw error;

              if (isAlreadyGoneError(error)) {
                stats.alreadyGone += 1;
              } else if (isSkippedDeleteError(error)) {
                stats.skipped += 1;
                failures.push(failureRecord(message, error));
              } else {
                stats.failed += 1;
                failures.push(failureRecord(message, error));
              }
            }

            emitProgress(message);

            if (filters.deleteDelay) {
              await this.sleeper(filters.deleteDelay, signal);
            }
          }
        }

        if (filters.deleteDelay && batches.length > 1) {
          await this.sleeper(filters.deleteDelay, signal);
        }
      }
    } catch (rawError) {
      const error = normalizeError(rawError);
      if (isAbortError(error)) {
        stats.stopped = true;
      } else {
        stats.stopped = true;
        stats.error = {
          code: error.code || 'UNKNOWN',
          message: humanError(error),
          fatal: !!error.fatal
        };
        this.emit('delete:error', stats.error);
      }
    } finally {
      stats.floodWaits = floodCounter.count;
      stats.floodSeconds = floodCounter.seconds;
      stats.processed = stats.deleted + stats.alreadyGone + stats.skipped + stats.failed;
      stats.durationMs = Date.now() - startedAt;
      stats.finishedAt = Date.now();
    }

    this.emit('delete:done', { stats, failures });
    return { stats, failures };
  }
}

export { floodWaitError };
