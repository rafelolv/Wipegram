import {
  describeFilters,
  mediaKind,
  messagePreview,
  normalizeFilters
} from './filters.js';
import { WipegramError, humanError, isAbortError, normalizeError } from './errors.js';
import { targetKey } from './telegram.js';
import {
  downloadJson,
  formatDate,
  formatDuration,
  formatNumber,
  formatTime,
  parseLocalDateTime
} from './util.js';
import styles from './styles.css';
import panelTemplate from './panel.html?dom';
import { createNodes, privacyIcon } from './dom.js';

const APP_VERSION = typeof __VERSION__ === 'undefined' ? 'dev' : __VERSION__;
const TYPE_CONFIRM_THRESHOLD = 100;
const VISIBLE_RESULTS = 8;
const MAX_RENDERED_RESULTS = 200;
const MAX_LOGS = 100;

const TYPE_BADGES = {
  text: 'Text',
  photo: 'Photo',
  video: 'Video',
  gif: 'GIF',
  music: 'Audio',
  voice: 'Voice',
  file: 'File',
  link: 'Link',
  poll: 'Poll',
  sticker: 'Sticker',
  other: 'Media'
};

function initialOf(title) {
  return (title || '?').trim().charAt(0).toLocaleUpperCase() || '?';
}

function slugify(value) {
  return String(value || 'chat')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'chat';
}

function dateStamp(date = new Date()) {
  const pad = number => String(number).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

export class WipegramUI {
  constructor({ api, engine, launcher = null } = {}) {
    this.api = api;
    this.engine = engine;
    this.launcher = launcher;
    this.launchers = launcher ? [launcher] : [];

    if (engine) {
      const previousHandler = typeof engine.onEvent === 'function' ? engine.onEvent : null;
      engine.onEvent = event => {
        previousHandler?.(event);
        this.handleEngineEvent(event);
      };
    }

    this.host = null;
    this.shadow = null;
    this.target = null;
    this.targetError = null;
    this.targetKey = '';
    this.entries = [];
    this.selectedIds = new Set();
    this.confirmedEntries = null;
    this.resultPage = 0;
    this.scanSnapshot = null;
    this.scanStats = null;
    this.deleteStats = null;
    this.failures = [];
    this.filters = null;
    this.phase = 'idle';
    this.busy = false;
    this.abortController = null;
    this.modalOpen = false;
    this.includeOthers = false;
    this.showAllResults = false;
    this.privacy = false;
    this.logs = [];
    this.pollTimer = null;
    this.toastTimer = null;
    this.progressTimer = null;
    this.operationStartedAt = 0;
    this.elapsedMs = 0;
    this.waitState = null;
    this.batchState = null;
    this.themeObserver = null;
    this.drag = null;
    this.destroyed = false;
  }

  mount() {
    if (this.host || this.destroyed) return;

    this.host = document.createElement('div');
    this.host.id = 'wipegram-ui';
    this.shadow = this.host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    this.shadow.append(style, createNodes(panelTemplate));
    (document.body || document.documentElement).appendChild(this.host);

    this.panel = this.shadow.getElementById('panel');
    this.fieldset = this.shadow.getElementById('filters-fieldset');
    this.targetName = this.shadow.getElementById('target-name');
    this.targetMeta = this.shadow.getElementById('target-meta');
    this.targetAvatar = this.shadow.getElementById('target-avatar');
    this.targetWarning = this.shadow.getElementById('target-warning');
    this.topicWrap = this.shadow.getElementById('topic-wrap');
    this.topicScope = this.shadow.getElementById('topic-scope');
    this.scanButton = this.shadow.getElementById('scan-btn');
    this.scanLabel = this.shadow.getElementById('scan-label');
    this.deleteButton = this.shadow.getElementById('delete-btn');
    this.deleteLabel = this.shadow.getElementById('delete-label');
    this.stopButton = this.shadow.getElementById('stop-btn');
    this.progressBar = this.shadow.getElementById('progress-bar');
    this.statusText = this.shadow.getElementById('status-text');
    this.metrics = this.shadow.querySelector('.wg-metrics');
    this.metricChecked = this.shadow.getElementById('metric-checked');
    this.metricFound = this.shadow.getElementById('metric-found');
    this.metricDeleted = this.shadow.getElementById('metric-deleted');
    this.metricFailed = this.shadow.getElementById('metric-failed');
    this.results = this.shadow.getElementById('results');
    this.resultsCount = this.shadow.getElementById('results-count');
    this.resultsList = this.shadow.getElementById('results-list');
    this.resultsToggle = this.shadow.getElementById('results-toggle');
    this.resultsMore = this.shadow.getElementById('results-more');
    this.formError = this.shadow.getElementById('form-error');
    this.logElement = this.shadow.getElementById('log');
    this.logCount = this.shadow.getElementById('log-count');
    this.resetButton = this.shadow.getElementById('reset-btn');
    this.reportButton = this.shadow.getElementById('report-btn');
    this.modal = this.shadow.getElementById('modal');
    this.modalTitle = this.shadow.getElementById('modal-title');
    this.modalTarget = this.shadow.getElementById('modal-target');
    this.modalFilters = this.shadow.getElementById('modal-filters');
    this.modalWarning = this.shadow.getElementById('modal-warning');
    this.confirmField = this.shadow.getElementById('confirm-field');
    this.confirmInput = this.shadow.getElementById('confirm-input');
    this.confirmDelete = this.shadow.getElementById('confirm-delete');
    this.confirmCancel = this.shadow.getElementById('confirm-cancel');
    this.toastElement = this.shadow.getElementById('toast');
    this.privacyButton = this.shadow.getElementById('privacy-btn');
    this.scopeCheckbox = this.shadow.getElementById('include-others');
    this.scopeLabel = this.shadow.getElementById('scope-label');
    this.checkedLabel = this.shadow.getElementById('checked-label');
    this.readyState = this.shadow.getElementById('ready-state');
    this.readyTitle = this.shadow.getElementById('ready-title');
    this.readyDescription = this.shadow.getElementById('ready-description');
    this.progressWrap = this.shadow.querySelector('.wg-progress-wrap');
    this.elapsedLabel = this.shadow.getElementById('elapsed-label');
    this.waitLabel = this.shadow.getElementById('wait-label');
    this.batchLabel = this.shadow.getElementById('batch-label');

    this.bindEvents();
    this.updateLimitPresets();
    this.restorePrivacy();
    this.watchTheme();
    this.updateButtons();
    this.renderTarget();
    this.addLog('info', 'Ready. Scan the open chat to preview messages.');
  }

  bindEvents() {
    this.shadow.getElementById('close-btn').addEventListener('click', () => this.close());
    this.shadow.getElementById('refresh-btn').addEventListener('click', () => this.refreshTarget({ notify: true }));
    this.privacyButton.addEventListener('click', () => this.togglePrivacy());
    this.scanButton.addEventListener('click', () => this.startScan());
    this.deleteButton.addEventListener('click', () => this.openConfirm());
    this.stopButton.addEventListener('click', () => this.abortOperation('Stopped by you.'));
    this.resultsToggle.addEventListener('click', () => {
      this.showAllResults = !this.showAllResults;
      this.resultPage = 0;
      this.renderResults();
    });
    for (const direction of ['prev', 'next']) {
      this.shadow.getElementById(`results-${direction}`).addEventListener('click', () => {
        this.resultPage += direction === 'next' ? 1 : -1;
        this.renderResults();
        this.resultsList.scrollIntoView({ block: 'nearest' });
      });
    }
    for (const [id, selected] of [['select-all-btn', true], ['select-none-btn', false]]) {
      this.shadow.getElementById(id).addEventListener('click', () => {
        if (this.busy || this.phase !== 'ready') return;
        this.hideConfirm();
        this.selectedIds = new Set(selected ? this.entries.map(message => message.id) : []);
        this.renderResults();
        this.updateButtons();
      });
    }
    for (const button of this.shadow.querySelectorAll('[data-limit]')) {
      button.addEventListener('click', () => {
        if (this.busy) return;
        const input = this.shadow.getElementById('max-messages');
        input.value = button.dataset.limit;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
    this.resetButton.addEventListener('click', () => this.resetResults());
    this.reportButton.addEventListener('click', () => this.downloadReport());
    this.confirmCancel.addEventListener('click', () => this.hideConfirm());
    this.confirmDelete.addEventListener('click', () => this.confirmDeleteMessages());
    this.confirmInput.addEventListener('input', () => this.updateConfirmState());
    this.shadow.getElementById('clear-log-btn').addEventListener('click', () => this.clearLog());
    this.scopeCheckbox.addEventListener('change', () => {
      this.includeOthers = this.scopeCheckbox.checked;
      this.hideConfirm();
      this.invalidateResults(null, { silent: true });
      this.refreshTarget({ quiet: true });
      if (this.targetError) this.showToast(this.targetError.message, 'warning');
      this.setStatus('Message scope changed. Scan again before deleting.');
    });
    this.modal.addEventListener('click', event => {
      if (event.target === this.modal) this.hideConfirm();
    });

    const filtersChanged = () => {
      this.clearFormError();
      this.updateLimitPresets();
      if (this.busy || !this.scanSnapshot) return;
      this.hideConfirm();
      this.invalidateResults('Filters changed. Scan again before deleting.');
    };
    this.fieldset.addEventListener('input', filtersChanged);
    this.fieldset.addEventListener('change', filtersChanged);

    // Page handlers see the Shadow DOM host instead of its editable input.
    // Intercept before document capture, including the sibling confirmation.
    this.onWindowKeyEvent = event => {
      if (!this.isOpen()) return;
      const inside = event.composedPath().includes(this.host);
      if (!inside && !this.modalOpen) return;
      if (!inside) {
        event.preventDefault();
        if (event.type === 'keydown' && event.key === 'Escape') this.hideConfirm();
        else this.focusConfirmation();
      } else if (event.type === 'keydown') {
        this.onPanelKeydown(event);
      }
      // Keep native editing/default actions, but exclude page shortcuts.
      event.stopImmediatePropagation();
    };
    for (const type of ['keydown', 'keypress', 'keyup']) {
      window.addEventListener(type, this.onWindowKeyEvent, true);
    }
    this.onWindowFocusIn = event => {
      if (!this.isOpen()) return;
      const path = event.composedPath();
      if (this.modalOpen && !path.includes(this.modal)) {
        event.stopImmediatePropagation();
        this.focusConfirmation();
      } else if (path.includes(this.host)) {
        event.stopImmediatePropagation();
      }
    };
    window.addEventListener('focusin', this.onWindowFocusIn, true);
    document.addEventListener('keydown', this.onDocumentKeydown = event => {
      if (event.key === 'Escape' && !this.panel.hidden) this.close();
    });
    document.addEventListener('pointerdown', this.onDocumentPointerDown = event => {
      if (this.panel.hidden || this.modalOpen || this.busy) return;
      const path = event.composedPath?.() || [];
      if (path.includes(this.host) || this.launchers.some(element => path.includes(element))) return;
      this.close();
    });

    this.bindDrag();
    window.addEventListener('resize', this.onResize = () => this.clampPanel());
  }

  watchTheme() {
    const update = () => this.updateTheme();
    update();
    this.themeObserver = new MutationObserver(update);
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    if (document.body) {
      this.themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
  }

  updateTheme() {
    const root = document.documentElement;
    const body = document.body;
    const dark = root.classList.contains('night') || root.classList.contains('tinted')
      || body?.classList.contains('night') || body?.classList.contains('tinted');
    this.host?.classList.toggle('wg-night', dark);
  }

  restorePrivacy() {
    try {
      this.privacy = localStorage.getItem('wipegram.privacy') === '1';
    } catch {
      this.privacy = false;
    }
    this.applyPrivacy();
  }

  togglePrivacy() {
    this.privacy = !this.privacy;
    try {
      localStorage.setItem('wipegram.privacy', this.privacy ? '1' : '0');
    } catch {
      /* storage can be unavailable */
    }
    this.applyPrivacy();
  }

  applyPrivacy() {
    if (!this.host) return;
    this.host.classList.toggle('wg-private', this.privacy);
    this.privacyButton.replaceChildren(privacyIcon(this.privacy));
    this.privacyButton.setAttribute('aria-pressed', String(this.privacy));
    this.privacyButton.title = this.privacy ? 'Privacy mode on' : 'Privacy mode off';
  }

  setLauncher(...elements) {
    this.launchers = elements.filter(Boolean);
    this.launcher = this.launchers[0] || null;
  }

  isOpen() {
    return !!this.panel && !this.panel.hidden;
  }

  open() {
    this.mount();
    if (this.isOpen()) {
      if (this.modalOpen) this.focusConfirmation();
      else this.panel.focus({ preventScroll: true });
      return;
    }

    this.panel.hidden = false;
    this.panel.classList.add('wg-open');
    this.refreshTarget({ quiet: true });
    this.startPolling();
    this.updateTheme();
    this.clampPanel();
    this.panel.focus({ preventScroll: true });
  }

  close() {
    if (!this.panel || this.panel.hidden) return;
    if (this.busy) {
      this.showToast('Stop the running operation before closing.', 'warning');
      return;
    }

    this.hideConfirm();
    if (this.includeOthers) {
      this.includeOthers = false;
      this.scopeCheckbox.checked = false;
      this.invalidateResults(null, { silent: true });
    }
    this.panel.hidden = true;
    this.panel.classList.remove('wg-open');
    this.stopPolling();
    const focusTarget = this.launchers.find(element => element?.isConnected);
    if (focusTarget) {
      try {
        focusTarget.focus({ preventScroll: true });
      } catch {
        /* ignore */
      }
    }
  }

  toggle() {
    if (this.isOpen()) this.close();
    else this.open();
  }

  startPolling() {
    this.stopPolling();
    this.pollTimer = setInterval(() => this.refreshTarget({ quiet: true }), 1_200);
  }

  stopPolling() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = null;
  }

  currentTargetInfo() {
    try {
      let target = this.api.getCurrentTarget({ includeOthers: this.includeOthers });
      if (this.includeOthers && this.target && (target.peerId !== this.target.peerId || target.selfId !== this.target.selfId)) {
        this.includeOthers = false;
        this.scopeCheckbox.checked = false;
        target = this.api.getCurrentTarget({ includeOthers: false });
      }
      return { target, error: null };
    } catch (error) {
      if (this.includeOthers) {
        this.includeOthers = false;
        this.scopeCheckbox.checked = false;
      }
      return { target: null, error: normalizeError(error) };
    }
  }

  refreshTarget({ quiet = false, notify = false } = {}) {
    if (!this.panel) return;
    const previousKey = this.targetKey;
    const wasBusy = this.busy;
    const { target, error } = this.currentTargetInfo();
    const nextKey = target ? targetKey(target) : '';
    const changed = nextKey !== previousKey;

    this.target = target;
    this.targetError = error;
    this.targetKey = nextKey;
    this.renderTarget();

    if (changed) {
      if (this.modalOpen) this.hideConfirm();
      if (wasBusy) {
        this.abortOperation('The open chat changed, so Wipegram stopped.');
        this.showToast('Chat changed. Operation stopped.', 'warning');
      } else if (this.scanSnapshot && nextKey !== this.scanSnapshot.key) {
        this.invalidateResults('The open chat changed. Scan again before deleting.');
      }
    }

    if (notify) {
      if (error) this.showToast(error.message, 'warning');
      else this.showToast('Chat refreshed.', 'success');
    } else if (!quiet && error) {
      this.showToast(error.message, 'warning');
    }
  }

  renderTarget() {
    if (!this.panel) return;
    this.scopeLabel.textContent = this.includeOthers ? 'Everyone — admin mode' : 'Your messages only';
    this.checkedLabel.textContent = this.includeOthers ? 'Checked' : 'Yours checked';
    const target = this.target;
    const error = this.targetError;

    if (target) {
      const meta = [target.kind];
      if (target.username) meta.push(`@${target.username}`);
      if (target.topMsgId) meta.push('topic');
      else if (target.isForum) meta.push('forum');
      if (target.isSaved) meta.push('only visible to you');

      this.targetName.textContent = target.title;
      this.targetMeta.textContent = meta.join(' · ');
      this.targetAvatar.textContent = initialOf(target.title);
      this.targetAvatar.classList.remove('wg-avatar-muted');
      this.targetWarning.classList.add('wg-hidden');
      this.targetWarning.textContent = '';
      this.topicWrap.hidden = !target.topMsgId;
    } else {
      this.targetName.textContent = error?.code === 'NO_CHAT' ? 'No chat selected' : 'Chat unavailable';
      this.targetMeta.textContent = error?.message || 'Open a private chat, group or Saved Messages.';
      this.targetAvatar.textContent = '?';
      this.targetAvatar.classList.add('wg-avatar-muted');
      this.topicWrap.hidden = true;

      if (error && error.code !== 'NO_CHAT') {
        this.targetWarning.textContent = error.message;
        this.targetWarning.classList.remove('wg-hidden');
      } else {
        this.targetWarning.classList.add('wg-hidden');
        this.targetWarning.textContent = '';
      }
    }

    this.updateButtons();
  }

  updateButtons() {
    if (!this.panel) return;
    const hasResults = this.entries.length > 0;
    this.fieldset.disabled = this.busy;
    this.shadow.getElementById('refresh-btn').disabled = this.busy;
    this.scanButton.hidden = this.busy;
    this.deleteButton.hidden = this.busy;
    this.stopButton.hidden = !this.busy;
    this.stopButton.disabled = this.busy && this.abortController?.signal.aborted === true;
    this.scanButton.disabled = this.busy || !this.target;
    this.deleteButton.disabled = this.busy || !this.selectedIds.size || this.phase !== 'ready';
    this.deleteLabel.textContent = this.selectedIds.size
      ? `Delete ${formatNumber(this.selectedIds.size)} message${this.selectedIds.size === 1 ? '' : 's'}`
      : 'Delete messages';
    this.scanLabel.textContent = this.scanSnapshot ? 'Scan again' : 'Scan messages';
    this.reportButton.disabled = this.busy || !this.scanSnapshot;
    this.resetButton.disabled = this.busy;
    this.metrics.hidden = false;
    this.progressWrap.hidden = !this.busy && !this.scanSnapshot;
    this.readyState.hidden = hasResults;
    const cleanupTitle = !this.deleteStats ? 'Cleanup interrupted'
      : this.deleteStats.error || this.deleteStats.failed ? 'Cleanup finished with errors'
        : this.deleteStats.stopped ? 'Cleanup stopped' : 'Cleanup finished';
    this.readyTitle.textContent = this.busy ? this.phase === 'deleting' ? 'Deleting messages' : 'Scan in progress'
      : this.phase === 'done' ? cleanupTitle : this.scanSnapshot ? 'No matching messages' : 'Ready to scan';
    this.readyDescription.textContent = !this.target ? 'Open a supported Telegram chat to get started.'
      : this.busy ? 'You can stop at any time. Review the results before deleting.'
        : this.phase === 'done' ? 'Scan again to refresh remaining messages. Download a report for details.'
        : this.scanSnapshot ? this.scanSnapshot.filters.scanMethod === 'auto' ? 'For older missing messages, choose Full history walk in Advanced options.' : 'Adjust your filters and scan again when you are ready.'
          : 'Choose your chat and filters, then scan for messages.';
    for (const control of this.shadow.querySelectorAll('.wg-result-select, #select-all-btn, #select-none-btn')) control.disabled = this.busy || this.phase !== 'ready';
    this.panel.classList.toggle('wg-ready', hasResults && this.phase === 'ready');
  }

  setBusy(busy, phase = this.phase) {
    if (busy && !this.busy) {
      this.operationStartedAt = Date.now();
      this.elapsedMs = 0;
      this.waitState = null;
      this.batchState = null;
      clearInterval(this.progressTimer);
      this.progressTimer = setInterval(() => this.updateProgressDetails(), 500);
    } else if (!busy) {
      if (this.busy) this.elapsedMs = Date.now() - this.operationStartedAt;
      clearInterval(this.progressTimer);
      this.progressTimer = null;
      this.waitState = null;
    }
    this.busy = busy;
    this.phase = phase;
    this.panel?.classList.toggle('wg-busy', busy);
    this.updateButtons();
    this.updateProgressDetails();
  }

  updateLimitPresets() {
    const limit = Number.parseInt(this.shadow.getElementById('max-messages').value, 10) || 0;
    for (const button of this.shadow.querySelectorAll('[data-limit]')) {
      button.setAttribute('aria-pressed', String(Number(button.dataset.limit) === limit));
    }
  }

  updateProgressDetails() {
    if (!this.elapsedLabel) return;
    const elapsed = this.busy ? Date.now() - this.operationStartedAt : this.elapsedMs;
    this.elapsedLabel.textContent = `Elapsed ${formatDuration(elapsed)}`;
    this.batchLabel.hidden = !this.batchState;
    this.batchLabel.textContent = this.batchState ? `Batch ${this.batchState.batch} of ${this.batchState.totalBatches}` : '';
    if (this.abortController?.signal.aborted) this.waitState = null;
    if (this.waitState && this.waitState.until <= Date.now()) {
      this.waitState = null;
      if (this.busy) this.setStatus('Resuming request…');
    }
    this.waitLabel.hidden = !this.waitState || !this.busy;
    this.waitLabel.textContent = this.waitState && this.busy
      ? `Retry in ${Math.max(0, Math.ceil((this.waitState.until - Date.now()) / 1000))}s` : '';
  }

  selectedEntries() {
    return this.entries.filter(message => this.selectedIds.has(message.id));
  }

  setStatus(text, tone = 'info') {
    if (!this.statusText) return;
    this.statusText.textContent = text;
    this.statusText.dataset.tone = tone;
  }

  setProgress(mode, fraction = 0) {
    if (!this.progressBar) return;
    this.progressBar.classList.remove('wg-indeterminate');
    if (mode === 'indeterminate') {
      this.progressBar.classList.add('wg-indeterminate');
      this.progressBar.style.width = '100%';
      return;
    }
    const percent = mode === 'determinate'
      ? Math.max(0, Math.min(100, fraction * 100))
      : 0;
    this.progressBar.style.width = `${percent}%`;
  }

  setMetrics({ checked, found, deleted, failed } = {}) {
    if (checked != null) this.metricChecked.textContent = formatNumber(checked);
    if (found != null) this.metricFound.textContent = formatNumber(found);
    if (deleted != null) this.metricDeleted.textContent = formatNumber(deleted);
    if (failed != null) this.metricFailed.textContent = formatNumber(failed);
  }

  resetMetrics() {
    this.setMetrics({ checked: 0, found: 0, deleted: 0, failed: 0 });
  }

  addLog(level, message) {
    if (!this.logElement) return;
    this.logs.push({ level, message, time: Date.now() });
    if (this.logs.length > MAX_LOGS) this.logs.splice(0, this.logs.length - MAX_LOGS);

    const entry = document.createElement('div');
    entry.className = `wg-log-entry wg-log-${level}`;
    const time = document.createElement('span');
    time.className = 'wg-log-time';
    time.textContent = formatTime();
    const text = document.createElement('span');
    text.className = 'wg-log-message';
    text.textContent = message;
    entry.append(time, text);
    this.logElement.appendChild(entry);

    while (this.logElement.childElementCount > MAX_LOGS) {
      this.logElement.firstElementChild?.remove();
    }
    this.logCount.textContent = String(this.logs.length);
    this.logElement.scrollTop = this.logElement.scrollHeight;
  }

  clearLog() {
    this.logs = [];
    this.logElement?.replaceChildren();
    if (this.logCount) this.logCount.textContent = '0';
  }

  showToast(message, tone = 'info') {
    if (!this.toastElement) return;
    clearTimeout(this.toastTimer);
    this.toastElement.textContent = message;
    this.toastElement.className = `wg-toast wg-toast-${tone}`;
    this.toastElement.hidden = false;
    this.toastElement.classList.add('wg-show');
    this.toastTimer = setTimeout(() => {
      this.toastElement?.classList.remove('wg-show');
      setTimeout(() => {
        if (this.toastElement && !this.toastElement.classList.contains('wg-show')) {
          this.toastElement.hidden = true;
        }
      }, 180);
    }, 4_000);
  }

  setFormError(message) {
    this.formError.textContent = message;
    this.formError.classList.remove('wg-hidden');
  }

  clearFormError() {
    this.formError.textContent = '';
    this.formError.classList.add('wg-hidden');
  }

  readFilters() {
    if (!this.shadow.getElementById('max-messages').checkValidity()) {
      throw new WipegramError('INVALID_FILTER', 'Message limit must be a whole number between 0 and 1,000,000. Zero means all matches.');
    }
    const raw = {
      includeOthers: this.includeOthers,
      query: this.shadow.getElementById('query-input').value,
      pattern: this.shadow.getElementById('pattern-input').value,
      type: this.shadow.getElementById('type-select').value,
      minDate: parseLocalDateTime(this.shadow.getElementById('min-date').value),
      maxDate: parseLocalDateTime(this.shadow.getElementById('max-date').value),
      skipPinned: this.shadow.getElementById('skip-pinned').checked,
      topicScope: this.topicScope.checked && !!this.target?.topMsgId,
      maxMessages: this.shadow.getElementById('max-messages').value,
      scanMethod: this.shadow.getElementById('scan-method').value,
      deleteDelay: this.shadow.getElementById('delete-delay').value,
      searchDelay: this.shadow.getElementById('search-delay').value
    };
    return normalizeFilters(raw, this.target || {});
  }

  async startScan() {
    if (this.busy) return;

    const { target, error } = this.currentTargetInfo();
    this.target = target;
    this.targetError = error;
    this.targetKey = target ? targetKey(target) : '';
    this.renderTarget();

    if (!target) {
      this.setFormError(error?.message || 'Open a chat first.');
      this.showToast(error?.message || 'Open a chat first.', 'warning');
      return;
    }

    let filters;
    try {
      filters = this.readFilters();
    } catch (rawError) {
      const normalized = normalizeError(rawError);
      this.setFormError(normalized.message);
      this.showToast(normalized.message, 'error');
      return;
    }

    this.clearFormError();
    this.hideConfirm();
    this.invalidateResults(null, { silent: true });
    this.scanSnapshot = null;
    this.deleteStats = null;
    this.failures = [];
    this.filters = filters;
    this.resetMetrics();
    this.setProgress('indeterminate');
    this.setStatus(filters.includeOthers ? 'Scanning everyone’s messages — admin mode…' : 'Scanning for your messages…', 'info');
    this.addLog('info', `Scan started (${filters.scanMethod} mode).`);

    const scanTarget = filters.topicScope
      ? target
      : { ...target, topMsgId: 0, threadId: 0, topicTitle: '' };
    const originalKey = targetKey(target);
    const snapshot = {
      key: originalKey,
      target: scanTarget,
      chat: target,
      filters,
      entries: [],
      stats: null,
      mode: null
    };
    this.scanSnapshot = snapshot;

    this.abortController = new AbortController();
    this.setBusy(true, 'scanning');
    this.setProgress('indeterminate');

    try {
      const result = await this.engine.scan({
        target: scanTarget,
        filters,
        signal: this.abortController.signal
      });

      if (this.targetKey !== originalKey) {
        this.invalidateResults('The open chat changed during the scan. Scan again.', { silent: true });
        this.setBusy(false, 'idle');
        this.showToast('The chat changed during the scan. Scan again.', 'warning');
        return;
      }

      this.entries = result.entries;
      this.selectedIds = new Set(result.entries.map(message => message.id));
      this.resultPage = 0;
      this.scanStats = result.stats;
      snapshot.entries = result.entries;
      snapshot.stats = result.stats;
      snapshot.mode = result.mode;
      this.scanSnapshot = snapshot;
      this.setBusy(false, result.entries.length ? 'ready' : 'idle');
      this.setProgress('determinate', 1);
      this.setMetrics({
        checked: result.stats.scanned,
        found: result.entries.length,
        deleted: 0,
        failed: 0
      });
      this.renderResults();
      this.updateButtons();
      if (result.stats.recentHistoryPages) {
        this.addLog('info', 'Auto checked one recent history page. If older messages are missing, choose Full history walk in Advanced options.');
      }

      const modeText = result.mode === 'history' ? 'full history scan' : result.stats.recentHistoryPages ? 'sender search + recent history' : 'sender search';
      this.addLog('success', `Scan finished with ${formatNumber(result.entries.length)} matching message${result.entries.length === 1 ? '' : 's'} (${modeText}, ${formatDuration(result.stats.durationMs)}).`);

      if (!result.entries.length) {
        this.setStatus('No messages matched these filters.', 'warning');
        this.showToast('No messages matched these filters.', 'warning');
      } else {
        this.setStatus(`${formatNumber(result.entries.length)} message${result.entries.length === 1 ? '' : 's'} ready to delete.`, 'success');
        this.showToast(`Found ${formatNumber(result.entries.length)} message${result.entries.length === 1 ? '' : 's'}.`, 'success');
      }
    } catch (rawError) {
      const normalized = normalizeError(rawError);
      if (isAbortError(normalized)) {
        this.setStatus('Scan stopped.', 'warning');
        this.addLog('warning', 'Scan stopped.');
        this.showToast('Scan stopped.', 'warning');
      } else {
        this.setStatus(normalized.message, 'error');
        this.addLog('error', normalized.message);
        this.showToast(normalized.message, 'error');
      }
      this.invalidateResults(null, { silent: true });
      this.scanSnapshot = null;
      this.setProgress(null);
      this.setBusy(false, 'idle');
    } finally {
      this.abortController = null;
      this.updateButtons();
    }
  }

  openConfirm() {
    if (this.busy || !this.selectedIds.size || !this.scanSnapshot) return;

    const current = this.currentTargetInfo();
    this.target = current.target;
    this.targetError = current.error;
    this.targetKey = current.target ? targetKey(current.target) : '';
    this.renderTarget();

    if (!current.target || this.targetKey !== this.scanSnapshot.key) {
      this.invalidateResults('The open chat changed. Scan again before deleting.');
      this.showToast('The chat changed. Scan again before deleting.', 'warning');
      return;
    }

    const target = this.scanSnapshot.target;
    this.confirmedEntries = this.selectedEntries();
    const count = this.confirmedEntries.length;
    const requireType = count > TYPE_CONFIRM_THRESHOLD || this.scanSnapshot.filters.includeOthers === true;

    this.modalTitle.textContent = `${this.scanSnapshot.filters.includeOthers ? 'Admin: delete' : 'Delete'} ${formatNumber(count)} message${count === 1 ? '' : 's'}?`;
    this.modalTarget.textContent = `${target.title}${target.username ? ` (@${target.username})` : ''}`;

    const filterParts = describeFilters(this.scanSnapshot.filters);
    filterParts.push(`${count} selected of ${this.entries.length} matches`);
    if (this.scanSnapshot.chat.topMsgId && !this.scanSnapshot.filters.topicScope) {
      filterParts.push('entire chat, all topics');
    }
    this.modalFilters.replaceChildren(...filterParts.map(part => {
      const item = document.createElement('li');
      item.textContent = part;
      return item;
    }));

    this.modalWarning.textContent = this.scanSnapshot.filters.includeOthers
      ? 'Admin mode includes other people’s messages. This deletes the selected messages for everyone. Telegram cannot undo this.'
      : target.isSaved
      ? 'These messages will be removed from your Saved Messages. Telegram cannot undo this.'
      : 'This deletes the messages from your account and, where Telegram permits, for everyone in this chat. Telegram cannot undo this.';

    if (!this.scanSnapshot.filters.skipPinned) this.modalWarning.textContent += ' Pinned messages are included.';
    this.confirmField.hidden = !requireType;
    this.confirmInput.value = '';
    this.modalOpen = true;
    this.modal.hidden = false;
    this.modal.classList.add('wg-show');
    this.panel.inert = true;
    this.updateConfirmState();
    this.focusConfirmation();
  }

  focusConfirmation() {
    if (!this.modalOpen) return;
    const target = this.confirmField.hidden ? this.confirmCancel : this.confirmInput;
    target.focus({ preventScroll: true });
  }

  updateConfirmState() {
    const count = this.confirmedEntries?.length || 0;
    const requireType = count > TYPE_CONFIRM_THRESHOLD || this.scanSnapshot?.filters.includeOthers === true;
    this.confirmDelete.disabled = requireType && this.confirmInput.value.trim() !== 'DELETE';
  }

  hideConfirm() {
    if (!this.modal) return;
    const wasOpen = this.modalOpen;
    this.modalOpen = false;
    this.confirmedEntries = null;
    this.modal.hidden = true;
    this.modal.classList.remove('wg-show');
    this.panel.inert = false;
    this.confirmInput.value = '';
    this.confirmDelete.disabled = false;
    this.modalTarget.textContent = '';
    this.modalFilters.replaceChildren();
    if (wasOpen && !this.busy && this.deleteButton && !this.deleteButton.hidden) {
      try {
        this.deleteButton.focus({ preventScroll: true });
      } catch {
        /* ignore */
      }
    }
  }

  async confirmDeleteMessages() {
    if (!this.modalOpen || this.busy) return;
    if (!this.confirmedEntries?.length) return;
    if (this.confirmedEntries.length !== this.selectedIds.size || this.confirmedEntries.some(message => !this.selectedIds.has(message.id))) { this.hideConfirm(); return; }
    if ((this.confirmedEntries.length > TYPE_CONFIRM_THRESHOLD || this.scanSnapshot?.filters.includeOthers) && this.confirmInput.value.trim() !== 'DELETE') return;
    if (this.targetKey !== this.scanSnapshot?.key) {
      this.hideConfirm();
      this.invalidateResults('The open chat changed. Scan again before deleting.');
      this.showToast('The chat changed. Scan again before deleting.', 'warning');
      return;
    }

    const confirmed = [...this.confirmedEntries];
    this.hideConfirm();
    await this.startDelete(confirmed);
  }

  async startDelete(confirmed) {
    if (this.busy || !this.scanSnapshot || !confirmed?.length) return;

    const { target, error } = this.currentTargetInfo();
    if (!target || targetKey(target) !== this.scanSnapshot.key) {
      this.invalidateResults(error?.message || 'The open chat changed. Scan again before deleting.');
      this.showToast(error?.message || 'The chat changed. Scan again before deleting.', 'warning');
      return;
    }

    const count = confirmed.length;
    this.scanSnapshot.selectedIds = confirmed.map(message => message.id);
    this.resetMetrics();
    this.setMetrics({ checked: this.scanStats?.scanned || 0, found: this.scanSnapshot.entries.length, deleted: 0, failed: 0 });
    this.setProgress('determinate', 0);
    this.setStatus(`Deleting 0 of ${formatNumber(count)} messages…`, 'info');
    this.addLog('info', `Delete started for ${formatNumber(count)} message${count === 1 ? '' : 's'}.`);

    this.abortController = new AbortController();
    this.setBusy(true, 'deleting');

    try {
      const result = await this.engine.delete({
        target: this.scanSnapshot.target,
        entries: confirmed,
        filters: this.scanSnapshot.filters,
        signal: this.abortController.signal
      });

      this.deleteStats = result.stats;
      this.failures = result.failures;
      this.scanSnapshot.deleteStats = result.stats;
      this.scanSnapshot.failures = result.failures;

      const stats = result.stats;
      const processed = stats.processed;
      this.setProgress('determinate', stats.total ? processed / stats.total : 1);
      this.setMetrics({ deleted: stats.deleted, failed: stats.failed });
      this.setBusy(false, 'done');

      const extras = [];
      if (stats.alreadyGone) extras.push(`${formatNumber(stats.alreadyGone)} already gone`);
      if (stats.skipped) extras.push(`${formatNumber(stats.skipped)} skipped`);
      if (stats.failed) extras.push(`${formatNumber(stats.failed)} failed`);

      if (stats.error) {
        this.setStatus(`${stats.error.message} ${formatNumber(stats.deleted)} of ${formatNumber(stats.total)} deleted.`, 'error');
        this.addLog('error', `${stats.error.message} Deleted ${formatNumber(stats.deleted)} of ${formatNumber(stats.total)}.`);
        this.showToast(stats.error.message, 'error');
      } else if (stats.stopped) {
        this.setStatus(`Stopped. ${formatNumber(stats.deleted)} of ${formatNumber(stats.total)} deleted.`, 'warning');
        this.addLog('warning', `Delete stopped after ${formatNumber(stats.deleted)} of ${formatNumber(stats.total)} messages.`);
        this.showToast(`Stopped after ${formatNumber(stats.deleted)} of ${formatNumber(stats.total)}.`, 'warning');
      } else if (stats.total === 0) {
        this.setStatus('There was nothing to delete.', 'warning');
      } else {
        const base = stats.failed
          ? `Finished with errors. ${formatNumber(stats.deleted)} deleted, ${formatNumber(stats.failed)} failed.`
          : `Done. ${formatNumber(stats.deleted)} message${stats.deleted === 1 ? '' : 's'} deleted.`;
        const summary = extras.length ? `${base} ${extras.join(', ')}.` : base;
        this.setStatus(summary, stats.failed ? 'warning' : 'success');
        this.addLog(stats.failed ? 'warning' : 'success', summary);
        this.showToast(summary, stats.failed ? 'warning' : 'success');
      }

      if (extras.length) {
        this.addLog('info', `Delete details: ${extras.join(', ')}.`);
      }
      if (stats.floodWaits) {
        this.addLog('info', `Telegram rate limits handled: ${formatNumber(stats.floodWaits)} wait${stats.floodWaits === 1 ? '' : 's'} (${formatDuration(stats.floodSeconds * 1000)}).`);
      }
    } catch (rawError) {
      const normalized = normalizeError(rawError);
      this.setBusy(false, 'done');
      this.setStatus(normalized.message, 'error');
      this.addLog('error', normalized.message);
      this.showToast(normalized.message, 'error');
    } finally {
      // Keep the original snapshot for reports, but require a fresh scan rather
      // than presenting processed candidates as messages still waiting to delete.
      this.entries = [];
      this.selectedIds.clear();
      this.renderResults();
      this.abortController = null;
      this.updateButtons();
    }
  }

  abortOperation(reason = 'Stopping…') {
    if (!this.abortController) return;
    if (!this.abortController.signal.aborted) {
      this.abortController.abort();
      this.addLog('warning', reason);
      this.setStatus('Stopping…', 'warning');
      this.stopButton.disabled = true;
    }
  }

  invalidateResults(message = null, { silent = false } = {}) {
    if (this.modalOpen) this.hideConfirm();
    this.entries = [];
    this.selectedIds.clear();
    this.resultPage = 0;
    this.waitState = null;
    this.batchState = null;
    this.elapsedMs = 0;
    this.updateProgressDetails();
    this.scanSnapshot = null;
    this.scanStats = null;
    this.deleteStats = null;
    this.failures = [];
    this.filters = null;
    this.phase = 'idle';
    this.showAllResults = false;
    this.renderResults();
    this.resetMetrics();
    this.setProgress(null);
    this.updateButtons();
    if (message) {
      this.setStatus(message, 'warning');
      if (!silent) this.addLog('warning', message);
    }
  }

  resetResults() {
    if (this.busy) return;
    this.invalidateResults(null, { silent: true });
    this.clearFormError();
    this.clearLog();
    this.addLog('info', 'Ready. Scan the open chat to preview messages.');
    this.setStatus('Choose filters, then scan the open chat.', 'info');
    this.refreshTarget({ quiet: true });
  }

  renderResults() {
    if (!this.results) return;
    const entries = this.entries;
    this.results.hidden = entries.length === 0;
    if (!entries.length) {
      this.resultsList.replaceChildren();
      this.resultsCount.textContent = '';
      this.resultsToggle.hidden = true;
      this.resultsMore.hidden = true;
      this.shadow.getElementById('result-pages').hidden = true;
      return;
    }

    this.resultsCount.textContent = `· ${formatNumber(entries.length)}`;
    this.resultsToggle.hidden = entries.length <= VISIBLE_RESULTS;
    this.resultsToggle.textContent = this.showAllResults ? 'Compact view' : 'Browse all';
    const limit = this.showAllResults ? MAX_RENDERED_RESULTS : VISIBLE_RESULTS;
    this.resultPage = Math.max(0, Math.min(this.resultPage, Math.ceil(entries.length / limit) - 1));
    const start = this.showAllResults ? this.resultPage * limit : 0;
    const shown = entries.slice(start, start + limit);
    const nodes = shown.map(message => this.createResultNode(message));
    this.resultsList.replaceChildren(...nodes);

    this.resultsMore.hidden = true;
    const pages = this.shadow.getElementById('result-pages');
    pages.hidden = !this.showAllResults || entries.length <= limit;
    this.shadow.getElementById('results-prev').disabled = this.resultPage === 0;
    this.shadow.getElementById('results-next').disabled = start + limit >= entries.length;
    this.shadow.getElementById('results-page-label').textContent = `${start + 1}–${Math.min(start + limit, entries.length)} of ${formatNumber(entries.length)}`;
    this.updateSelection();
  }

  updateSelection() {
    this.shadow.getElementById('selection-count').textContent = `${formatNumber(this.selectedIds.size)} of ${formatNumber(this.entries.length)} selected`;
    if (!this.busy && this.phase === 'ready') {
      this.setStatus(this.selectedIds.size
        ? `${formatNumber(this.selectedIds.size)} selected of ${formatNumber(this.entries.length)} matches. Review before deleting.`
        : 'No messages selected. Select a match to enable deletion.', this.selectedIds.size ? 'success' : 'warning');
    }
    this.updateButtons();
  }

  createResultNode(message) {
    const row = document.createElement('div');
    row.className = 'wg-result';
    row.dataset.messageId = String(message.id);
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'wg-result-select';
    checkbox.checked = this.selectedIds.has(message.id);
    checkbox.disabled = this.busy || this.phase !== 'ready';
    checkbox.setAttribute('aria-label', `Select message ${message.id}`);
    checkbox.addEventListener('change', () => {
      if (this.busy || this.phase !== 'ready' || !row.isConnected) return;
      this.hideConfirm();
      if (checkbox.checked) this.selectedIds.add(message.id);
      else this.selectedIds.delete(message.id);
      row.classList.toggle('wg-unselected', !checkbox.checked);
      this.updateSelection();
    });
    row.classList.toggle('wg-unselected', !checkbox.checked);

    const top = document.createElement('div');
    top.className = 'wg-result-top';

    const date = document.createElement('span');
    date.className = 'wg-result-date';
    date.textContent = `${formatDate((message.date || 0) * 1000)} · #${message.id}`;

    const badge = document.createElement('span');
    badge.className = 'wg-badge';
    badge.textContent = TYPE_BADGES[mediaKind(message)] || 'Message';

    top.append(checkbox, date, badge);

    const text = document.createElement('div');
    text.className = 'wg-result-text wg-blur';
    text.textContent = messagePreview(message) || '[Empty message]';

    row.append(top, text);
    return row;
  }

  buildReport() {
    if (!this.scanSnapshot) return null;
    const snapshot = this.scanSnapshot;
    const target = snapshot.target;
    const filters = snapshot.filters;
    const selection = new Set(snapshot.selectedIds || this.selectedIds);
    const messages = snapshot.entries.map(message => ({
      id: message.id,
      selected: selection.has(message.id),
      date: message.date ? new Date(message.date * 1000).toISOString() : null,
      type: mediaKind(message),
      preview: messagePreview(message)
    }));

    return {
      app: 'Wipegram',
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      selection: { ids: [...selection], count: selection.size, matches: snapshot.entries.length },
      page: location.href,
      target: {
        title: target.title,
        kind: target.kind,
        username: target.username || '',
        peerId: String(target.peerId),
        isChannel: !!target.isChannel,
        isSaved: !!target.isSaved,
        topicScoped: !!filters.topicScope,
        topicId: target.topMsgId || snapshot.chat.topMsgId || 0
      },
      filters: {
        includeOthers: !!filters.includeOthers,
        type: filters.type,
        query: filters.query,
        pattern: filters.pattern,
        minDate: filters.minDate ? new Date(filters.minDate).toISOString() : null,
        maxDate: filters.maxDate ? new Date(filters.maxDate).toISOString() : null,
        skipPinned: filters.skipPinned,
        topicScope: filters.topicScope,
        maxMessages: filters.maxMessages,
        scanMethod: filters.scanMethod,
        deleteDelay: filters.deleteDelay,
        searchDelay: filters.searchDelay
      },
      scan: snapshot.stats || this.scanStats,
      delete: this.deleteStats,
      failures: this.failures,
      messages
    };
  }

  downloadReport() {
    const report = this.buildReport();
    if (!report) return;
    const filename = `wipegram-${slugify(report.target.title)}-${dateStamp()}.json`;
    try {
      downloadJson(filename, report);
      this.addLog('info', 'JSON report downloaded.');
      this.showToast('Report downloaded.', 'success');
    } catch (rawError) {
      const normalized = normalizeError(rawError);
      this.addLog('error', `Could not download the report: ${normalized.message}`);
      this.showToast('Could not download the report.', 'error');
    }
  }

  handleEngineEvent(event) {
    switch (event.type) {
      case 'scan:start':
        this.setStatus(event.filters.includeOthers ? 'Scanning everyone’s messages — admin mode…' : 'Scanning for your messages…', 'info');
        this.setProgress('indeterminate');
        break;
      case 'scan:progress': {
        this.setMetrics({ checked: event.scanned, found: event.matched });
        const checked = formatNumber(event.scanned);
        const found = formatNumber(event.matched);
        this.setStatus(
          event.mode === 'search'
            ? `Searching… ${found} of your messages found.`
            : `Scanning history… ${checked} ${this.includeOthers ? 'messages' : 'of your messages'} checked, ${found} found.`,
          'info'
        );
        break;
      }
      case 'scan:fallback':
        this.addLog('warning', `${event.reason} Continuing with a full history scan.`);
        this.setStatus('Switching to full history…', 'warning');
        this.showToast('Switching to a full history scan.', 'warning');
        break;
      case 'scan:verify':
        this.addLog('info', event.reason);
        this.setStatus('Checking recent messages missing from search…', 'info');
        break;
      case 'scan:warning':
        this.addLog('warning', `${event.message}${event.error ? ` (${event.error})` : ''}`);
        break;
      case 'scan:done':
        break;
      case 'delete:start':
        this.setStatus(`Deleting 0 of ${formatNumber(event.total)} messages…`, 'info');
        this.setProgress('determinate', 0);
        break;
      case 'delete:batch':
        this.waitState = null;
        this.batchState = { batch: event.batch, totalBatches: event.totalBatches };
        this.updateProgressDetails();
        break;
      case 'delete:progress': {
        this.setMetrics({ deleted: event.deleted, failed: event.failed });
        const fraction = event.total ? event.processed / event.total : 0;
        this.setProgress('determinate', fraction);
        this.setStatus(`Deleting ${formatNumber(event.processed)} of ${formatNumber(event.total)} messages…`, 'info');
        break;
      }
      case 'delete:warning':
        this.addLog('warning', `${event.message}${event.error ? ` (${event.error})` : ''}`);
        break;
      case 'delete:error':
        this.addLog('error', event.message);
        break;
      case 'delete:done':
        break;
      case 'flood':
        this.addLog('warning', `Telegram rate limit: waiting ${formatDuration(event.seconds * 1000)}.`);
        this.waitState = { until: event.until || Date.now() + event.seconds * 1000 };
        this.setStatus('Telegram rate limit — paused.', 'warning');
        this.updateProgressDetails();
        this.showToast(`Rate limited. Waiting ${formatDuration(event.seconds * 1000)}…`, 'warning');
        break;
      case 'retry':
        this.addLog('warning', `${event.message} Retrying in ${formatDuration(event.delay)} (attempt ${event.attempt}).`);
        this.waitState = { until: Date.now() + event.delay };
        this.setStatus('Network hiccup — waiting to retry…', 'warning');
        this.updateProgressDetails();
        break;
      default:
        break;
    }
  }

  onPanelKeydown(event) {
    event.stopPropagation();

    if (event.key === 'Escape') {
      event.preventDefault();
      if (this.modalOpen) this.hideConfirm();
      else this.close();
      return;
    }

    if (event.key === 'Tab' && this.modalOpen) {
      const focusable = [...this.modal.querySelectorAll('button, input')]
        .filter(element => !element.disabled && !element.hidden && element.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = this.shadow.activeElement;
      if (event.shiftKey && (active === first || !this.modal.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !this.modal.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  bindDrag() {
    const handle = this.shadow.getElementById('drag-handle');
    handle.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.target.closest('button')) return;
      if (window.matchMedia('(max-width: 680px)').matches) return;

      const rect = this.panel.getBoundingClientRect();
      this.drag = {
        startX: event.clientX,
        startY: event.clientY,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      };
      this.panel.classList.add('wg-dragging');
      handle.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    });

    handle.addEventListener('pointermove', event => {
      if (!this.drag) return;
      const nextLeft = this.drag.left + (event.clientX - this.drag.startX);
      const nextTop = this.drag.top + (event.clientY - this.drag.startY);
      this.positionPanel(nextLeft, nextTop);
    });

    const end = () => {
      if (!this.drag) return;
      this.drag = null;
      this.panel.classList.remove('wg-dragging');
    };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  }

  positionPanel(left, top) {
    const rect = this.panel.getBoundingClientRect();
    const margin = 8;
    const maxLeft = Math.max(margin, window.innerWidth - rect.width - margin);
    const maxTop = Math.max(margin, window.innerHeight - rect.height - margin);
    this.panel.style.left = `${Math.min(maxLeft, Math.max(margin, left))}px`;
    this.panel.style.top = `${Math.min(maxTop, Math.max(margin, top))}px`;
    this.panel.style.right = 'auto';
  }

  clampPanel() {
    if (!this.panel || this.panel.style.right !== 'auto' || !this.panel.style.left) return;
    const rect = this.panel.getBoundingClientRect();
    this.positionPanel(rect.left, rect.top);
  }

  destroy() {
    this.destroyed = true;
    this.stopPolling();
    this.abortController?.abort();
    this.themeObserver?.disconnect();
    if (this.toastTimer) clearTimeout(this.toastTimer);
    clearInterval(this.progressTimer);
    document.removeEventListener('keydown', this.onDocumentKeydown);
    document.removeEventListener('pointerdown', this.onDocumentPointerDown);
    for (const type of ['keydown', 'keypress', 'keyup']) {
      window.removeEventListener(type, this.onWindowKeyEvent, true);
    }
    window.removeEventListener('focusin', this.onWindowFocusIn, true);
    window.removeEventListener('resize', this.onResize);
    this.host?.remove();
    this.host = null;
    this.shadow = null;
  }
}
