import test from 'node:test';
import assert from 'node:assert/strict';

import { WipegramEngine, DELETE_BATCH_SIZE, MAX_FLOOD_WAIT_SECONDS } from '../src/engine.js';
import { normalizeFilters } from '../src/filters.js';
import { isAbortError } from '../src/errors.js';
import { TelegramApi, normalizeMessagesResult } from '../src/telegram.js';

const target = {
  peerId: 777,
  inputPeer: { _: 'inputPeerUser', user_id: 777, access_hash: '1' },
  inputChannel: null,
  isChannel: false,
  isSaved: false,
  selfId: 42,
  title: 'Test Chat',
  threadId: 0,
  topMsgId: 0
};

function msg(id, overrides = {}) {
  return {
    _: 'message',
    id,
    date: 1_700_000_000 + id,
    pFlags: { out: true },
    from_id: { _: 'peerUser', user_id: 42 },
    message: `message ${id}`,
    ...overrides
  };
}

function makeFilters(overrides = {}) {
  return normalizeFilters({ skipPinned: false, ...overrides }, target);
}

function emptyPage() {
  return { messages: [], count: 0, notModified: false };
}

function page(messages, count = messages.length) {
  return { messages, count, notModified: false };
}

function makeEngine(api, extra = {}) {
  const events = [];
  const engine = new WipegramEngine({
    api,
    onEvent: event => events.push(event),
    sleeper: async () => {},
    ...extra
  });
  return { engine, events };
}

test('search scan paginates, skips pinned messages, and emits progress', async () => {
  const pages = new Map([
    [0, page([msg(300), msg(299)], 4)],
    [299, page([msg(298), msg(297)], 4)],
    [297, emptyPage()]
  ]);
  const offsets = [];
  const api = {
    getPinnedIds: async () => new Set([299]),
    searchPage: async ({ offsetId, filter }) => {
      offsets.push(offsetId);
      assert.deepEqual(filter, { _: 'inputMessagesFilterEmpty' });
      return pages.get(offsetId) || emptyPage();
    }
  };
  const { engine, events } = makeEngine(api);
  const result = await engine.scan({
    target,
    filters: makeFilters({ scanMethod: 'search', skipPinned: true }),
    signal: new AbortController().signal
  });

  assert.equal(result.mode, 'search');
  assert.deepEqual(result.entries.map(item => item.id), [300, 298, 297]);
  assert.deepEqual(offsets, [0, 299, 297]);
  assert.equal(result.stats.pages, 3);
  assert.equal(result.stats.scanned, 4);
  assert.equal(result.stats.matched, 3);
  assert.equal(result.stats.totalFound, 4);
  assert.equal(result.stats.floodWaits, 0);
  assert.ok(events.some(event => event.type === 'scan:progress'));
  assert.ok(events.some(event => event.type === 'scan:done'));
});

test('maxMessages caps the scan before requesting the next page', async () => {
  let calls = 0;
  const api = {
    searchPage: async () => {
      calls += 1;
      return page([msg(300), msg(299), msg(298)], 100);
    }
  };
  const { engine } = makeEngine(api);
  const result = await engine.scan({
    target,
    filters: makeFilters({ scanMethod: 'search', maxMessages: 2 }),
    signal: new AbortController().signal
  });

  assert.deepEqual(result.entries.map(item => item.id), [300, 299]);
  assert.equal(calls, 1);
});

test('search pagination stops when a cursor repeats', async () => {
  let calls = 0;
  const api = {
    searchPage: async () => {
      calls += 1;
      return page([msg(5)], 1);
    }
  };
  const { engine } = makeEngine(api);
  const result = await engine.scan({
    target,
    filters: makeFilters({ scanMethod: 'search' }),
    signal: new AbortController().signal
  });

  assert.deepEqual(result.entries.map(item => item.id), [5]);
  assert.equal(calls, 2);
});

test('auto mode falls back to history when sender search is unsupported', async () => {
  let searchCalls = 0;
  let historyCalls = 0;
  const api = {
    searchPage: async () => {
      searchCalls += 1;
      throw { type: 'SEARCH_QUERY_EMPTY', code: 400, message: 'SEARCH_QUERY_EMPTY' };
    },
    historyPage: async ({ offsetId }) => {
      historyCalls += 1;
      if (offsetId) return emptyPage();
      return page([
        msg(10, { message: 'hello there' }),
        msg(9, { pFlags: {}, from_id: { _: 'peerUser', user_id: 7 }, message: 'other user' }),
        msg(8, { message: 'hello again' })
      ]);
    }
  };
  const { engine, events } = makeEngine(api);
  const result = await engine.scan({
    target,
    filters: makeFilters({ scanMethod: 'auto', query: 'hello' }),
    signal: new AbortController().signal
  });

  assert.equal(searchCalls, 1);
  assert.equal(historyCalls, 2);
  assert.equal(result.mode, 'history');
  assert.deepEqual(result.entries.map(item => item.id), [10, 8]);
  assert.ok(events.some(event => event.type === 'scan:fallback'));
});

test('auto verifies an empty sender search against history and preserves ownership and pins', async () => {
  const calls = [];
  const api = {
    getPinnedIds: async () => new Set([304]),
    searchPage: async () => emptyPage(),
    historyPage: async ({ offsetId, target: scope }) => {
      calls.push(offsetId);
      assert.equal(scope, target);
      return offsetId ? emptyPage() : page([
        msg(305), msg(304),
        msg(303, { from_id: { _: 'peerUser', user_id: 7 } }),
        msg(302, { from_id: { _: 'peerChannel', channel_id: 55 } })
      ]);
    }
  };
  const { engine, events } = makeEngine(api);
  const result = await engine.scan({ target, filters: makeFilters({ scanMethod: 'auto', skipPinned: true }) });
  assert.deepEqual(result.entries.map(message => message.id), [305]);
  assert.deepEqual(calls, [0, 302]);
  assert.equal(result.mode, 'history');
  assert.equal(events.filter(event => event.type === 'scan:verify').length, 1);
});

test('auto finds messages missing from a nonempty search without duplicating results', async () => {
  const api = {
    searchPage: async ({ offsetId }) => offsetId ? emptyPage() : page([msg(10, { message: 'hello indexed' })]),
    historyPage: async ({ offsetId }) => offsetId ? emptyPage() : page([
      msg(12, { message: 'hello fresh' }),
      msg(11, { message: 'does not match the text filter' }),
      msg(10, { message: 'hello indexed' }),
      msg(9, { message: 'hello pinned', pFlags: { out: true, pinned: true } })
    ])
  };
  const { engine } = makeEngine(api);
  api.getPinnedIds = async () => new Set();
  const result = await engine.scan({ target, filters: makeFilters({ scanMethod: 'auto', query: 'hello', skipPinned: true }) });
  assert.deepEqual(result.entries.map(message => message.id), [12, 10]);
});

for (const isChannel of [false, true]) {
  test(`scan after deletion and engine reload finds fresh messages despite empty search (${isChannel ? 'supergroup' : 'private'})`, async () => {
    let messages = [msg(100)];
    let searchIndex = [...messages];
    const scanOffsets = [];
    const scanTarget = { ...target, isChannel, inputChannel: isChannel ? { _: 'inputChannel', channel_id: 55, access_hash: '1' } : null };
    const root = {
      myId: 42,
      managers: { apiManager: { invokeApi: async (method, params) => {
        if (method === 'messages.search') {
          if (params.filter._ === 'inputMessagesFilterPinned') return { _: 'messages.messages', messages: [] };
          return { _: 'messages.messages', messages: searchIndex.filter(message => !params.offset_id || message.id < params.offset_id) };
        }
        if (method === 'messages.getHistory') {
          scanOffsets.push(params.offset_id);
          return { _: 'messages.messages', messages: messages.filter(message => !params.offset_id || message.id < params.offset_id) };
        }
        if (method.endsWith('.deleteMessages')) {
          messages = messages.filter(message => !params.id.includes(message.id));
          searchIndex = searchIndex.filter(message => !params.id.includes(message.id));
          return { _: 'messages.affectedMessages' };
        }
        throw new Error(`Unexpected method: ${method}`);
      } } }
    };
    const createEngine = () => makeEngine(new TelegramApi({ root: () => root })).engine;
    const engine = createEngine();
    const filters = makeFilters({ scanMethod: 'auto', skipPinned: true });
    const first = await engine.scan({ target: scanTarget, filters });
    assert.deepEqual(first.entries.map(message => message.id), [100]);
    const deletion = await engine.delete({ target: scanTarget, entries: first.entries, filters });
    assert.equal(deletion.stats.deleted, 1);
    messages.push(msg(200));
    const fresh = await createEngine().scan({ target: scanTarget, filters });
    assert.deepEqual(fresh.entries.map(message => message.id), [200]);
    assert.deepEqual(scanOffsets, [0, 100, 0, 200]);
  });
}

test('history continues past a page containing only deleted-message placeholders', async () => {
  const offsets = [];
  const { engine } = makeEngine({ historyPage: async ({ offsetId }) => {
    offsets.push(offsetId);
    const messages = offsetId === 0
      ? [{ _: 'messageEmpty', id: 300 }, { _: 'messageEmpty', id: 299 }]
      : offsetId === 299 ? [msg(298)] : [];
    return normalizeMessagesResult({ _: 'messages.messagesSlice', messages, count: 3 });
  } });
  const result = await engine.scan({ target, filters: makeFilters({ scanMethod: 'history' }) });
  assert.deepEqual(result.entries.map(message => message.id), [298]);
  assert.deepEqual(offsets, [0, 299, 298]);
});

test('auto message limit stops before history verification', async () => {
  const { engine } = makeEngine({
    searchPage: async () => page([msg(3), msg(2), msg(1)]),
    historyPage: async () => { throw new Error('Requested cap already satisfied'); }
  });
  const result = await engine.scan({ target, filters: makeFilters({ scanMethod: 'auto', maxMessages: 2 }) });
  assert.deepEqual(result.entries.map(message => message.id), [3, 2]);
  assert.equal(result.mode, 'search');
});

test('history verification keeps topic scope and local media, text, regex and date filters', async () => {
  const topicTarget = { ...target, topMsgId: 55, threadId: 55 };
  const filters = makeFilters({
    scanMethod: 'auto', type: 'photos', query: 'invoice', pattern: '^invoice',
    minDate: 2_000_000, maxDate: 3_000_000
  });
  const photo = { _: 'messageMediaPhoto' };
  const { engine } = makeEngine({
    searchPage: async () => emptyPage(),
    historyPage: async ({ target: scope, offsetId }) => {
      assert.equal(scope, topicTarget);
      return offsetId ? emptyPage() : page([
        msg(7, { date: 3_001, message: 'invoice too new', media: photo }),
        msg(6, { date: 2_500, message: 'invoice retained', media: photo }),
        msg(5, { date: 2_499, message: 'invoice wrong type' }),
        msg(4, { date: 2_498, message: 'wrong query', media: photo }),
        msg(3, { date: 2_497, message: 'wrong prefix invoice', media: photo }),
        msg(2, { date: 1_999, message: 'invoice too old', media: photo })
      ]);
    }
  });
  const result = await engine.scan({ target: topicTarget, filters });
  assert.deepEqual(result.entries.map(message => message.id), [6]);
});

test('auto retries incomplete search through history; incomplete history is never successful', async () => {
  const { engine } = makeEngine({
    searchPage: async () => normalizeMessagesResult({ _: 'messages.messagesNotModified' }),
    historyPage: async ({ offsetId }) => offsetId ? emptyPage() : page([msg(10)])
  });
  const result = await engine.scan({ target, filters: makeFilters({ scanMethod: 'auto' }) });
  assert.deepEqual(result.entries.map(message => message.id), [10]);
  for (const response of [{ _: 'messages.messagesNotModified' }, {}]) {
    engine.api.historyPage = async () => normalizeMessagesResult(response);
    await assert.rejects(engine.scan({ target, filters: makeFilters({ scanMethod: 'history' }) }), { code: 'INCOMPLETE_RESPONSE' });
  }
});

test('history refuses stalled pagination instead of returning partial success', async () => {
  const { engine } = makeEngine({ historyPage: async () => page([msg(10)]) });
  await assert.rejects(engine.scan({ target, filters: makeFilters({ scanMethod: 'history' }) }), { code: 'PAGINATION_STALLED' });
});

test('Stop during history verification aborts instead of returning matches', async () => {
  const controller = new AbortController();
  const { engine } = makeEngine({
    searchPage: async () => emptyPage(),
    historyPage: async () => { controller.abort(); return page([msg(10)]); }
  });
  await assert.rejects(engine.scan({ target, filters: makeFilters({ scanMethod: 'auto' }), signal: controller.signal }), isAbortError);
});

test('explicit search mode surfaces a search failure instead of falling back', async () => {
  const api = {
    searchPage: async () => {
      throw { type: 'FROM_PEER_INVALID', code: 400, message: 'FROM_PEER_INVALID' };
    }
  };
  const { engine, events } = makeEngine(api);

  await assert.rejects(
    engine.scan({
      target,
      filters: makeFilters({ scanMethod: 'search' }),
      signal: new AbortController().signal
    }),
    error => error.code === 'FROM_PEER_INVALID'
  );
  assert.equal(events.some(event => event.type === 'scan:fallback'), false);
});

test('history scan applies local filters and stops before the min date', async () => {
  let calls = 0;
  const api = {
    historyPage: async () => {
      calls += 1;
      return page([
        msg(210, { date: 3_000 }),
        msg(200, { date: 2_000 }),
        msg(190, { date: 1_900 })
      ]);
    }
  };
  const { engine } = makeEngine(api);
  const result = await engine.scan({
    target,
    filters: makeFilters({ scanMethod: 'history', minDate: 2_000_000 }),
    signal: new AbortController().signal
  });

  assert.equal(calls, 1);
  assert.deepEqual(result.entries.map(item => item.id), [210, 200]);
});

test('a pinned-message load failure stops the scan instead of risking pinned messages', async () => {
  let searchCalls = 0;
  const api = {
    getPinnedIds: async () => {
      throw { type: 'SERVER_ERROR', code: 500, message: 'SERVER_ERROR' };
    },
    searchPage: async () => {
      searchCalls += 1;
      return emptyPage();
    }
  };
  const { engine, events } = makeEngine(api);

  await assert.rejects(
    engine.scan({
      target,
      filters: makeFilters({ scanMethod: 'search', skipPinned: true }),
      signal: new AbortController().signal
    }),
    error => error.code === 'PINNED_UNAVAILABLE'
      && /uncheck/i.test(error.message)
  );
  assert.equal(searchCalls, 0);
  assert.equal(events.some(event => event.type === 'scan:done'), false);
});

test('unchecking skipPinned avoids loading pinned messages', async () => {
  let pinnedCalls = 0;
  const api = {
    getPinnedIds: async () => {
      pinnedCalls += 1;
      return new Set();
    },
    searchPage: async () => page([msg(1)], 1)
  };
  const { engine } = makeEngine(api);
  const result = await engine.scan({
    target,
    filters: makeFilters({ scanMethod: 'search', skipPinned: false }),
    signal: new AbortController().signal
  });

  assert.equal(pinnedCalls, 0);
  assert.deepEqual(result.entries.map(item => item.id), [1]);
});

test('scan respects an already-aborted signal', async () => {
  const api = { searchPage: async () => emptyPage() };
  const { engine, events } = makeEngine(api);
  const controller = new AbortController();
  controller.abort();

  await assert.rejects(
    engine.scan({
      target,
      filters: makeFilters({ scanMethod: 'search' }),
      signal: controller.signal
    }),
    error => isAbortError(error)
  );
  assert.ok(events.some(event => event.type === 'scan:aborted'));
});

test('delete sends batches of at most 100 and reports progress', async () => {
  const batchSizes = [];
  const api = {
    deleteBatch: async ({ ids }) => {
      batchSizes.push(ids.length);
      assert.ok(ids.length <= DELETE_BATCH_SIZE);
      return {};
    }
  };
  const { engine, events } = makeEngine(api);
  const entries = Array.from({ length: 250 }, (_, index) => msg(index + 1));
  const result = await engine.delete({
    target,
    entries,
    filters: {},
    signal: new AbortController().signal
  });

  assert.deepEqual(batchSizes, [100, 100, 50]);
  assert.equal(result.stats.deleted, 250);
  assert.equal(result.stats.processed, 250);
  assert.equal(result.stats.batches, 3);
  assert.equal(result.stats.failed, 0);
  assert.equal(result.stats.stopped, false);
  assert.ok(events.some(event => event.type === 'delete:progress'));
  assert.ok(events.some(event => event.type === 'delete:done'));
});

test('a rejected batch is retried one message at a time and sorted by outcome', async () => {
  const calls = [];
  const api = {
    deleteBatch: async ({ ids }) => {
      calls.push(ids);
      if (ids.length > 1) {
        throw { type: 'MESSAGE_DELETE_FORBIDDEN', code: 403, message: 'MESSAGE_DELETE_FORBIDDEN' };
      }
      if (ids[0] === 2) throw { type: 'MSG_ID_INVALID', code: 400, message: 'MSG_ID_INVALID' };
      if (ids[0] === 3) throw { type: 'MESSAGE_DELETE_FORBIDDEN', code: 403, message: 'MESSAGE_DELETE_FORBIDDEN' };
      if (ids[0] === 4) throw { type: 'BAD_REQUEST', code: 400, message: 'BAD_REQUEST' };
      return {};
    }
  };
  const { engine, events } = makeEngine(api);
  const result = await engine.delete({
    target,
    entries: [1, 2, 3, 4, 5].map(id => msg(id)),
    filters: {},
    signal: new AbortController().signal
  });

  assert.equal(calls.length, 6);
  assert.equal(result.stats.deleted, 2);
  assert.equal(result.stats.alreadyGone, 1);
  assert.equal(result.stats.skipped, 1);
  assert.equal(result.stats.failed, 1);
  assert.equal(result.stats.processed, 5);
  assert.equal(result.failures.length, 2);
  assert.ok(result.failures.some(failure => failure.id === 3 && failure.code === 'MESSAGE_DELETE_FORBIDDEN'));
  assert.ok(events.some(event => event.type === 'delete:warning'));
});

test('flood waits are slept, retried, and counted', async () => {
  let calls = 0;
  const sleeps = [];
  const api = {
    deleteBatch: async () => {
      calls += 1;
      if (calls === 1) throw { type: 'FLOOD_WAIT_2', code: 420, message: 'FLOOD_WAIT_2' };
      return {};
    }
  };
  const { engine, events } = makeEngine(api, {
    sleeper: async ms => { sleeps.push(ms); }
  });
  const result = await engine.delete({
    target,
    entries: [msg(1)],
    filters: {},
    signal: new AbortController().signal
  });

  assert.deepEqual(sleeps, [2_000]);
  assert.equal(result.stats.deleted, 1);
  assert.equal(result.stats.floodWaits, 1);
  assert.equal(result.stats.floodSeconds, 2);
  assert.ok(events.some(event => event.type === 'flood' && event.seconds === 2));
});

test('flood waits longer than 15 minutes stop the operation', async () => {
  const api = {
    deleteBatch: async () => {
      throw { type: `FLOOD_WAIT_${MAX_FLOOD_WAIT_SECONDS + 1}`, code: 420, message: 'too long' };
    }
  };
  const { engine } = makeEngine(api);
  const result = await engine.delete({
    target,
    entries: [msg(1)],
    filters: {},
    signal: new AbortController().signal
  });

  assert.equal(result.stats.deleted, 0);
  assert.equal(result.stats.stopped, true);
  assert.equal(result.stats.error.code, 'FLOOD_TOO_LONG');
});

test('transient server errors are retried with backoff', async () => {
  let calls = 0;
  const sleeps = [];
  const api = {
    deleteBatch: async () => {
      calls += 1;
      if (calls === 1) throw { type: 'SERVER_ERROR', code: 500, message: 'SERVER_ERROR' };
      return {};
    }
  };
  const { engine, events } = makeEngine(api, {
    sleeper: async ms => { sleeps.push(ms); }
  });
  const result = await engine.delete({
    target,
    entries: [msg(1)],
    filters: {},
    signal: new AbortController().signal
  });

  assert.equal(result.stats.deleted, 1);
  assert.equal(calls, 2);
  assert.deepEqual(sleeps, [1_000]);
  assert.ok(events.some(event => event.type === 'retry'));
});

test('aborting during delete stops before the next batch and keeps partial stats', async () => {
  const controller = new AbortController();
  const batchSizes = [];
  const api = {
    deleteBatch: async ({ ids }) => {
      batchSizes.push(ids.length);
      controller.abort();
      return {};
    }
  };
  const { engine } = makeEngine(api);
  const entries = Array.from({ length: 150 }, (_, index) => msg(index + 1));
  const result = await engine.delete({
    target,
    entries,
    filters: {},
    signal: controller.signal
  });

  assert.deepEqual(batchSizes, [100]);
  assert.equal(result.stats.deleted, 100);
  assert.equal(result.stats.stopped, true);
  assert.equal(result.stats.error, null);
});

test('deleting an empty list finishes cleanly', async () => {
  const api = { deleteBatch: async () => { throw new Error('should not be called'); } };
  const { engine, events } = makeEngine(api);
  const result = await engine.delete({
    target,
    entries: [],
    filters: {},
    signal: new AbortController().signal
  });

  assert.equal(result.stats.total, 0);
  assert.equal(result.stats.processed, 0);
  assert.ok(events.some(event => event.type === 'delete:done'));
});

test('delete refuses foreign or anonymous candidates before any mutation', async () => {
  let calls = 0;
  const { engine } = makeEngine({ deleteBatch: async () => { calls++; } });
  for (const from_id of [{ _: 'peerUser', user_id: 7 }, { _: 'peerChannel', channel_id: 55 }]) {
    await assert.rejects(engine.delete({ target, entries: [msg(1, { from_id })] }), { code: 'INVALID_CANDIDATE' });
  }
  assert.equal(calls, 0);
});

test('delete refreshes pinned protection after preview and stops if refresh fails', async () => {
  const deleted = [];
  const api = {
    getPinnedIds: async () => new Set([2]),
    deleteBatch: async ({ ids }) => deleted.push(...ids)
  };
  const { engine } = makeEngine(api);
  const result = await engine.delete({ target, entries: [msg(1), msg(2)], filters: makeFilters({ skipPinned: true }) });
  assert.deepEqual(deleted, [1]);
  assert.equal(result.stats.skipped, 1);
  assert.equal(result.failures[0].code, 'PINNED_MESSAGE');
  api.getPinnedIds = async () => { throw { type: 'PINNED_UNAVAILABLE' }; };
  const stopped = await engine.delete({ target, entries: [msg(3)], filters: makeFilters({ skipPinned: true }) });
  assert.equal(stopped.stats.stopped, true);
  assert.equal(stopped.stats.error.code, 'PINNED_UNAVAILABLE');
  assert.deepEqual(deleted, [1]);
});

test('default checked count includes only unique own messages across search and history', async () => {
  const own = msg(10);
  const other = msg(9, { pFlags: {}, from_id: { _: 'peerUser', user_id: 7 } });
  const { engine } = makeEngine({
    searchPage: async ({ offsetId }) => offsetId ? emptyPage() : page([own]),
    historyPage: async ({ offsetId }) => offsetId ? emptyPage() : page([own, other], 1000)
  });
  const result = await engine.scan({ target, filters: makeFilters() });
  assert.equal(result.stats.scanned, 1);
  assert.equal(result.stats.inspected, 3);
  assert.equal(result.stats.totalFound, 1);
  assert.deepEqual(result.entries.map(message => message.id), [10]);
});

test('admin scope requires an explicit target and filter agreement before reads or deletes', async () => {
  const { engine } = makeEngine({
    historyPage: async () => { throw new Error('Must not read'); },
    deleteBatch: async () => { throw new Error('Must not delete'); }
  });
  for (const scope of [target, { ...target, includeOthers: true, canDeleteOthers: false }]) {
    await assert.rejects(engine.scan({ target: scope, filters: { ...makeFilters(), includeOthers: true } }), { code: 'MODERATION_FORBIDDEN' });
    await assert.rejects(engine.delete({ target: scope, filters: { includeOthers: true }, entries: [msg(1)] }), { code: 'MODERATION_FORBIDDEN' });
  }
  await assert.rejects(engine.delete({ target: { ...target, includeOthers: true, canDeleteOthers: true }, entries: [msg(1)] }), { code: 'MODERATION_FORBIDDEN' });
  await assert.rejects(engine.delete({ target: { ...target, includeOthers: true, canDeleteOthers: true }, filters: { includeOthers: 'true' }, entries: [msg(1)] }), { code: 'MODERATION_FORBIDDEN' });
});

test('explicit admin mode includes others, still excludes pins and preserves batch deletion rules', async () => {
  const scope = { ...target, includeOthers: true, canDeleteOthers: true };
  const foreign = msg(9, { from_id: { _: 'peerUser', user_id: 7 } });
  const deleted = [];
  const { engine } = makeEngine({
    getPinnedIds: async () => new Set([8]),
    searchPage: async () => { throw new Error('Admin scan must use history'); },
    historyPage: async ({ offsetId }) => offsetId ? emptyPage() : page([msg(10), foreign, msg(8)]),
    deleteBatch: async ({ ids }) => deleted.push(...ids)
  });
  const filters = normalizeFilters({ includeOthers: true, skipPinned: true }, scope);
  const result = await engine.scan({ target: scope, filters });
  assert.deepEqual(result.entries.map(message => message.id), [10, 9]);
  assert.equal(result.stats.scanned, 3);
  const deletion = await engine.delete({ target: scope, filters, entries: result.entries });
  assert.equal(deletion.stats.deleted, 2);
  assert.deepEqual(deleted, [10, 9]);
});

test('ownership is rechecked before each delete retry after preview', async () => {
  const candidate = msg(10);
  let requests = 0;
  const { engine } = makeEngine({ deleteBatch: async () => {
    requests++;
    candidate.from_id = { _: 'peerUser', user_id: 7 };
    throw { type: 'NETWORK_ERROR' };
  } });
  const result = await engine.delete({ target, entries: [candidate] });
  assert.equal(requests, 1);
  assert.equal(result.stats.stopped, true);
  assert.equal(result.stats.error.code, 'INVALID_CANDIDATE');
});
