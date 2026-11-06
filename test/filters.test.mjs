import test from 'node:test';
import assert from 'node:assert/strict';

import {
  describeFilters,
  isLinkMessage,
  isOwnMessage,
  localMatches,
  mediaKind,
  messagePreview,
  messageText,
  mtFilterForType,
  normalizeFilters,
  typeLabel
} from '../src/filters.js';
import { WipegramError } from '../src/errors.js';

const SELF = 42;
const target = { topMsgId: 0, selfId: SELF };

function message(id, overrides = {}) {
  return {
    _: 'message',
    id,
    date: 1_700_000_000 + id,
    pFlags: { out: true },
    from_id: { _: 'peerUser', user_id: SELF },
    message: `message ${id}`,
    ...overrides
  };
}

function filters(overrides = {}) {
  return normalizeFilters({ skipPinned: false, ...overrides }, target);
}

test('normalizeFilters rejects invalid regex and reversed dates', () => {
  assert.throws(() => normalizeFilters({ pattern: '[' }, target), WipegramError);
  assert.throws(() => normalizeFilters({ minDate: 2_000, maxDate: 1_000 }, target), WipegramError);
});

test('normalizeFilters clamps numbers and falls back to safe defaults', () => {
  const normalized = normalizeFilters({
    type: 'nope',
    scanMethod: 'nope',
    maxMessages: -4,
    deleteDelay: 999_999,
    searchDelay: -10
  }, target);

  assert.equal(normalized.type, 'all');
  assert.equal(normalized.scanMethod, 'auto');
  assert.equal(normalized.maxMessages, 0);
  assert.equal(normalized.deleteDelay, 60_000);
  assert.equal(normalized.searchDelay, 0);
  assert.equal(normalized.skipPinned, true);
});

test('topic scope only applies when the target has a topic', () => {
  assert.equal(normalizeFilters({ topicScope: true }, target).topicScope, false);
  assert.equal(normalizeFilters({ topicScope: true }, { ...target, topMsgId: 123 }).topicScope, true);
});

test('message type labels and MTProto filters map correctly', () => {
  assert.equal(typeLabel('photos'), 'Photos');
  assert.equal(typeLabel('unknown'), 'All messages');
  assert.deepEqual(mtFilterForType('videos'), { _: 'inputMessagesFilterVideo' });
  assert.deepEqual(mtFilterForType('unknown'), { _: 'inputMessagesFilterEmpty' });
});

test('isOwnMessage understands outgoing flags and self sender', () => {
  assert.equal(isOwnMessage(message(1)), true);
  assert.equal(isOwnMessage({ _: 'message', id: 1, pFlags: {}, from_id: { _: 'peerUser', user_id: SELF } }, SELF), true);
  assert.equal(isOwnMessage({ _: 'message', id: 1, pFlags: {}, from_id: { _: 'peerUser', user_id: 7 } }, SELF), false);
  assert.equal(isOwnMessage({ _: 'message', pFlags: { out: true } }), true);
});

test('outgoing flag cannot override another explicit sender or anonymous channel identity', () => {
  assert.equal(isOwnMessage(message(1, { from_id: { _: 'peerUser', user_id: 7 } }), SELF), false);
  assert.equal(isOwnMessage(message(1, { from_id: { _: 'peerChannel', channel_id: 55 } }), SELF), false);
  assert.equal(localMatches(message(1, { pFlags: { out: true, pinned: true } }), filters({ skipPinned: true })), false);
});

test('localMatches applies pinned, date, text and regex filters in history mode', () => {
  const normalized = filters({
    query: 'invoice',
    minDate: 1_700_000_100_000,
    pattern: '^message 1',
    skipPinned: true
  });
  const pinned = new Set([101]);

  assert.equal(localMatches(message(101, { message: 'message 101 invoice' }), normalized, { mode: 'history', pinnedIds: pinned }), false);
  assert.equal(localMatches(message(100, { message: 'message 100 invoice' }), normalized, { mode: 'history', pinnedIds: pinned }), true);
  assert.equal(localMatches(message(100, { message: 'message 100 receipt' }), normalized, { mode: 'history', pinnedIds: pinned }), false);
  assert.equal(localMatches(message(100, { message: 'message 100 invoice', date: 1 }), normalized, { mode: 'history', pinnedIds: pinned }), false);
});

test('history mode applies media filters locally, search mode trusts Telegram', () => {
  const photo = message(50, {
    message: '',
    media: { _: 'messageMediaPhoto' }
  });
  const file = message(51, {
    message: '',
    media: {
      _: 'messageMediaDocument',
      document: { attributes: [{ _: 'documentAttributeFilename', file_name: 'note.pdf' }] }
    }
  });

  assert.equal(localMatches(photo, filters({ type: 'photos' }), { mode: 'history' }), true);
  assert.equal(localMatches(photo, filters({ type: 'files' }), { mode: 'history' }), false);
  assert.equal(localMatches(file, filters({ type: 'files' }), { mode: 'history' }), true);
  // Search mode leaves media classification to Telegram.
  assert.equal(localMatches(photo, filters({ type: 'files' }), { mode: 'search' }), true);
  // Text-only search still rejects media messages locally.
  assert.equal(localMatches(photo, filters({ type: 'text' }), { mode: 'search' }), false);
});

test('mediaKind and messagePreview cover common Telegram media', () => {
  const voice = message(60, {
    message: '',
    media: {
      _: 'messageMediaDocument',
      document: {
        attributes: [{ _: 'documentAttributeAudio', pFlags: { voice: true } }]
      }
    }
  });
  const gif = message(61, {
    message: '',
    media: {
      _: 'messageMediaDocument',
      document: { attributes: [{ _: 'documentAttributeAnimated' }] }
    }
  });
  const animatedVideo = message(65, {
    message: '',
    media: {
      _: 'messageMediaDocument',
      document: {
        attributes: [
          { _: 'documentAttributeVideo' },
          { _: 'documentAttributeAnimated' }
        ]
      }
    }
  });
  const video = message(62, {
    message: '',
    media: {
      _: 'messageMediaDocument',
      document: {
        attributes: [{ _: 'documentAttributeVideo', pFlags: { round_message: true } }]
      }
    }
  });
  const link = message(63, { message: 'see https://example.com' });

  assert.equal(mediaKind(voice), 'voice');
  assert.equal(mediaKind(gif), 'gif');
  assert.equal(mediaKind(animatedVideo), 'gif');
  assert.equal(mediaKind(video), 'video');
  assert.equal(mediaKind(link), 'text');
  assert.equal(isLinkMessage(link), true);
  assert.equal(messagePreview(voice), '[Voice message]');
  assert.equal(messagePreview(gif), '[GIF]');
  assert.equal(messagePreview(video), '[Video message]');
  assert.equal(messageText(message(64, { message: 'hello' })), 'hello');
});

test('describeFilters includes active filters', () => {
  const normalized = filters({
    type: 'photos',
    query: 'holiday',
    pattern: '^IMG',
    skipPinned: true,
    maxMessages: 25,
    minDate: 1_700_000_000_000,
    maxDate: 1_800_000_000_000
  });
  const description = describeFilters({ ...normalized, topicScope: false }).join(' | ');
  assert.match(description, /Photos/);
  assert.match(description, /contains “holiday”/);
  assert.match(description, /matches \/\^IMG\/i/);
  assert.match(description, /pinned skipped/);
  assert.match(description, /up to 25 messages/);
});
