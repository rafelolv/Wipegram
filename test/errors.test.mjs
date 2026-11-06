import test from 'node:test';
import assert from 'node:assert/strict';

import {
  WipegramError,
  humanError,
  isAlreadyGoneError,
  isFatalError,
  isSearchFallbackError,
  isSkippedDeleteError,
  isTransientError,
  normalizeError,
  parseFloodWait
} from '../src/errors.js';

function tgError(type, code = 400, message = type) {
  return { type, code, message };
}

test('parseFloodWait understands Telegram wait errors', () => {
  assert.equal(parseFloodWait(tgError('FLOOD_WAIT_42', 420)), 42);
  assert.equal(parseFloodWait(tgError('SLOWMODE_WAIT_7', 420)), 7);
  assert.equal(parseFloodWait(tgError('FLOOD_PREMIUM_WAIT_3', 420)), 3);
  assert.equal(parseFloodWait({ type: 'FLOOD_WAIT_0', message: 'FLOOD_WAIT_0' }), 0);
  assert.equal(parseFloodWait(new Error('nope')), 0);
});

test('error classification matches Telegram semantics', () => {
  assert.equal(isFatalError(tgError('SESSION_REVOKED', 401)), true);
  assert.equal(isFatalError(tgError('FROZEN_METHOD_INVALID', 403)), true);
  assert.equal(isFatalError(tgError('FLOOD_WAIT_9', 420)), false);
  assert.equal(isSearchFallbackError(tgError('SEARCH_QUERY_EMPTY')), true);
  assert.equal(isSearchFallbackError(tgError('FROM_PEER_INVALID')), true);
  assert.equal(isAlreadyGoneError(tgError('MESSAGE_ID_INVALID')), true);
  assert.equal(isSkippedDeleteError(tgError('MESSAGE_DELETE_FORBIDDEN')), true);
  assert.equal(isTransientError(tgError('SERVER_ERROR', 500)), true);
  assert.equal(isTransientError(tgError('TIMEOUT', 408)), true);
  assert.equal(isTransientError(tgError('FLOOD_WAIT_9', 420)), false);
});

test('normalizeError preserves WipegramError and wraps Telegram errors', () => {
  const original = new WipegramError('INVALID_FILTER', 'bad input');
  assert.equal(normalizeError(original), original);

  const normalized = normalizeError(tgError('CHANNEL_PRIVATE', 403));
  assert.ok(normalized instanceof WipegramError);
  assert.equal(normalized.code, 'CHANNEL_PRIVATE');
  assert.equal(normalized.fatal, true);
  assert.equal(normalized.details.code, 403);
});

test('humanError gives readable messages', () => {
  assert.match(humanError(tgError('CHANNEL_PRIVATE', 403)), /member|recognize/i);
  assert.match(humanError(tgError('FLOOD_WAIT_123', 420)), /123 seconds/);
  assert.match(humanError(new WipegramError('CUSTOM', 'custom text')), /custom text/);
  assert.match(humanError(new Error('mystery')), /mystery/);
});

test('abort errors normalize to ABORTED', () => {
  const error = new Error('stopped');
  error.name = 'AbortError';
  const normalized = normalizeError(error);
  assert.equal(normalized.code, 'ABORTED');
  assert.equal(normalized.fatal, false);
});
