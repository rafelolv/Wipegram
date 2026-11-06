import test from 'node:test';
import assert from 'node:assert/strict';

import {
  chunk,
  clamp,
  formatDuration,
  formatNumber,
  midToServerId,
  parseLocalDateTime,
  toUnixSeconds,
  truncate
} from '../src/util.js';
import { parseFloodWait } from '../src/errors.js';

test('chunk splits arrays without losing items', () => {
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(chunk([], 100), []);
});

test('clamp and truncate behave at boundaries', () => {
  assert.equal(clamp(5, 0, 3), 3);
  assert.equal(clamp(-5, 0, 3), 0);
  assert.equal(truncate('  hello   world  ', 8), 'hello w…');
  assert.equal(truncate('short', 20), 'short');
});

test('midToServerId removes the channel offset', () => {
  assert.equal(midToServerId(0), 0);
  assert.equal(midToServerId(123), 123);
  assert.equal(midToServerId(0x100000005), 5);
  assert.equal(midToServerId(-1), 0);
});

test('toUnixSeconds only converts positive finite values', () => {
  assert.equal(toUnixSeconds(1_700_000_000_500), 1_700_000_000);
  assert.equal(toUnixSeconds(0), 0);
  assert.equal(toUnixSeconds(NaN), 0);
});

test('formatDuration formats seconds, minutes and hours', () => {
  assert.equal(formatDuration(5_000), '5s');
  assert.equal(formatDuration(65_000), '1m 5s');
  assert.equal(formatDuration(3_661_000), '1h 1m 1s');
});

test('formatNumber uses grouping', () => {
  assert.equal(formatNumber(1234567), new Intl.NumberFormat().format(1234567));
  assert.equal(formatNumber('bad'), '0');
});

test('parseLocalDateTime accepts local inputs and rejects junk', () => {
  assert.equal(parseLocalDateTime(''), null);
  assert.equal(parseLocalDateTime('not-a-date'), null);
  assert.ok(parseLocalDateTime('2026-11-06T12:30') > 0);
});

test('flood parser tolerates nested error fields', () => {
  assert.equal(parseFloodWait({ message: 'FLOOD_WAIT_12' }), 12);
  assert.equal(parseFloodWait({ type: 'FLOOD_WAIT_1', message: 'x' }), 1);
});
