import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TelegramApi,
  getCurrentTarget,
  normalizeMessagesResult,
  peerKind,
  peerTitle,
  peerUsername
} from '../src/telegram.js';
import { targetKey, MAX_PINNED_PAGES } from '../src/telegram.js';

function message(id) {
  return { _: 'message', id, date: 1_700_000_000 + id, pFlags: { out: true }, message: `m${id}` };
}

function apiWithHandler(handler) {
  const calls = [];
  const api = new TelegramApi({
    root: () => ({
      managers: {
        apiManager: {
          invokeApi: async (method, params) => {
            calls.push({ method, params });
            return handler(method, params);
          }
        }
      }
    })
  });
  return { api, calls };
}

test('peer helpers format users, groups and channels', () => {
  assert.equal(peerTitle({ _: 'user', first_name: 'Ada', last_name: 'Lovelace' }), 'Ada Lovelace');
  assert.equal(peerTitle({ _: 'channel', title: 'News' }), 'News');
  assert.equal(peerTitle({ _: 'user', username: 'ada' }), '@ada');
  assert.equal(peerUsername({ username: 'ada' }), 'ada');
  assert.equal(peerUsername({ usernames: [{ active: false, username: 'old' }, { active: true, username: 'new' }] }), 'new');
  assert.equal(peerKind({ _: 'user', pFlags: {} }), 'Private chat');
  assert.equal(peerKind({ _: 'user', pFlags: { bot: true } }), 'Bot');
  assert.equal(peerKind({ _: 'chat' }), 'Group');
  assert.equal(peerKind({ _: 'channel', pFlags: { megagroup: true } }), 'Supergroup');
  assert.equal(peerKind({ _: 'channel', pFlags: {} }), 'Channel');
  assert.equal(peerKind({ _: 'user' }, false, true), 'Saved Messages');
});

test('normalizeMessagesResult drops empty messages and keeps counts', () => {
  const normalized = normalizeMessagesResult({
    _: 'messages.messages',
    messages: [message(2), { _: 'messageEmpty' }, null, message(1)],
    count: 42
  });
  assert.deepEqual(normalized.messages.map(item => item.id), [2, 1]);
  assert.equal(normalized.count, 42);
  assert.equal(normalized.notModified, false);
  assert.equal(normalizeMessagesResult({ _: 'messages.messagesNotModified' }).notModified, true);
});

test('deleted-message placeholders preserve pagination without becoming candidates', () => {
  const result = normalizeMessagesResult({
    _: 'messages.messagesSlice',
    messages: [{ _: 'messageEmpty', id: 100 }, { _: 'messageEmpty', id: 99 }], count: 200
  });
  assert.deepEqual(result.messages, []);
  assert.equal(result.nextOffsetId, 99);
  assert.equal(result.incomplete, false);
  assert.equal(normalizeMessagesResult({}).incomplete, true);
});

test('pinned lookup continues past deleted placeholders to protect older pins', async () => {
  const { api, calls } = apiWithHandler((method, params) => ({
    _: 'messages.messagesSlice', messages: !params.offset_id
      ? [{ _: 'messageEmpty', id: 100 }] : params.offset_id === 100 ? [message(99)] : []
  }));
  const ids = await api.getPinnedIds({ target: { inputPeer: { _: 'inputPeerSelf' } } });
  assert.deepEqual([...ids], [99]);
  assert.deepEqual(calls.map(call => call.params.offset_id), [0, 100, 99]);
});

test('searchPage builds a sender-scoped MTProto search request', async () => {
  const { api, calls } = apiWithHandler(() => ({
    _: 'messages.messages',
    messages: [message(9)],
    count: 1
  }));
  const target = {
    inputPeer: { _: 'inputPeerChannel', channel_id: 55, access_hash: '1' },
    topMsgId: 77
  };
  const result = await api.searchPage({
    target,
    query: 'hello',
    filter: { _: 'inputMessagesFilterPhotos' },
    minDate: 2_000_000,
    maxDate: 3_000_000,
    offsetId: 9
  });

  assert.equal(result.count, 1);
  const call = calls[0];
  assert.equal(call.method, 'messages.search');
  assert.deepEqual(call.params.peer, target.inputPeer);
  assert.equal(call.params.q, 'hello');
  assert.deepEqual(call.params.from_id, { _: 'inputPeerSelf' });
  assert.deepEqual(call.params.filter, { _: 'inputMessagesFilterPhotos' });
  assert.equal(call.params.min_date, 1_999);
  assert.equal(call.params.max_date, 3_001);
  assert.equal(call.params.offset_id, 9);
  assert.equal(call.params.top_msg_id, 77);
  assert.equal(call.params.limit, 100);
});

test('historyPage uses getHistory without a topic and getReplies in a topic', async () => {
  const { api, calls } = apiWithHandler(() => ({ _: 'messages.messages', messages: [] }));
  const target = { inputPeer: { _: 'inputPeerUser', user_id: 1, access_hash: '1' }, topMsgId: 0 };
  await api.historyPage({ target, offsetId: 10 });
  assert.equal(calls[0].method, 'messages.getHistory');
  assert.equal(calls[0].params.offset_id, 10);

  await api.historyPage({ target: { ...target, topMsgId: 55 }, offsetId: 10 });
  assert.equal(calls[1].method, 'messages.getReplies');
  assert.equal(calls[1].params.msg_id, 55);
});

test('getPinnedIds paginates pinned search results', async () => {
  let page = 0;
  const { api, calls } = apiWithHandler(() => {
    page += 1;
    if (page === 1) {
      return { _: 'messages.messages', messages: [message(100), message(99)], count: 3 };
    }
    return { _: 'messages.messages', messages: [], count: 3 };
  });
  const ids = await api.getPinnedIds({
    target: { inputPeer: { _: 'inputPeerUser', user_id: 1, access_hash: '1' }, topMsgId: 0 }
  });

  assert.deepEqual([...ids].sort((a, b) => b - a), [100, 99]);
  assert.equal(calls[0].method, 'messages.search');
  assert.deepEqual(calls[0].params.filter, { _: 'inputMessagesFilterPinned' });
  assert.equal(calls[1].params.offset_id, 99);
});

test('deleteBatch picks the right MTProto method', async () => {
  const { api, calls } = apiWithHandler(() => ({ _: 'messages.affectedMessages' }));
  const inputChannel = { _: 'inputChannel', channel_id: 55, access_hash: '1' };

  await api.deleteBatch({
    target: { isChannel: false, inputChannel: null },
    ids: [1, 2]
  });
  assert.equal(calls[0].method, 'messages.deleteMessages');
  assert.deepEqual(calls[0].params, { revoke: true, id: [1, 2] });

  await api.deleteBatch({
    target: { isChannel: true, inputChannel },
    ids: [3]
  });
  assert.equal(calls[1].method, 'channels.deleteMessages');
  assert.deepEqual(calls[1].params, { channel: inputChannel, id: [3] });

  assert.equal(await api.deleteBatch({ target: {}, ids: [] }), null);
  assert.equal(calls.length, 2);
});

function withWindow(root, app, fn) {
  const previous = globalThis.window;
  globalThis.window = { rootScope: root, appImManager: app };
  try {
    return fn();
  } finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
}

function makeManagers({ self = 42, peer, isChannel = false, inputPeer, inputChannel = null } = {}) {
  return {
    apiManager: { invokeApi: async () => ({ _: 'messages.messages', messages: [] }) },
    appPeersManager: {
      getPeer: () => peer,
      isChannel: () => isChannel,
      getInputPeerById: () => inputPeer
    },
    appChatsManager: {
      getChannelInput: () => inputChannel
    }
  };
}

test('getCurrentTarget extracts a private chat target', () => {
  const peer = { _: 'user', id: 777, first_name: 'Test', last_name: 'Chat' };
  const root = { myId: 42, managers: makeManagers({ peer, inputPeer: { _: 'inputPeerUser', user_id: 777 } }) };
  const app = {
    chat: {
      peerId: 777,
      type: 'chat',
      isPreview: false,
      isBroadcast: false,
      isMonoforum: false,
      isForum: false,
      threadId: 0
    }
  };

  const target = withWindow(root, app, () => getCurrentTarget());
  assert.equal(target.title, 'Test Chat');
  assert.equal(target.kind, 'Private chat');
  assert.equal(target.isSaved, false);
  assert.equal(target.topMsgId, 0);
});

test('getCurrentTarget resets thread scope for Saved Messages and blocks saved conversations', () => {
  const savedPeer = { _: 'user', id: 42, pFlags: { self: true }, first_name: 'Me' };
  const baseChat = {
    peerId: 42,
    type: 'saved',
    isPreview: false,
    isBroadcast: false,
    isMonoforum: false,
    isForum: false,
    threadId: 0
  };
  const root = { myId: 42, managers: makeManagers({ peer: savedPeer, inputPeer: { _: 'inputPeerSelf' } }) };
  const target = withWindow(root, { chat: baseChat }, () => getCurrentTarget());
  assert.equal(target.title, 'Saved Messages');
  assert.equal(target.isSaved, true);
  assert.equal(target.topMsgId, 0);

  const app = { chat: { ...baseChat, threadId: 777 } };
  assert.throws(
    () => withWindow(root, app, () => getCurrentTarget()),
    error => error.code === 'UNSUPPORTED_CHAT'
  );
});

test('getCurrentTarget blocks broadcast channels and unsupported chat tabs', () => {
  const peer = { _: 'channel', id: 55, title: 'Broadcast', pFlags: {} };
  const root = {
    myId: 42,
    managers: makeManagers({
      peer,
      isChannel: true,
      inputPeer: { _: 'inputPeerChannel', channel_id: 55 },
      inputChannel: { _: 'inputChannel', channel_id: 55 }
    })
  };
  const baseChat = {
    peerId: new Number(0x100000000 + 55),
    type: 'chat',
    isPreview: false,
    isBroadcast: true,
    isMonoforum: false,
    isForum: false,
    threadId: 0
  };

  assert.throws(
    () => withWindow(root, { chat: baseChat }, () => getCurrentTarget()),
    error => error.code === 'BROADCAST_CHANNEL'
  );

  const scheduled = { ...baseChat, isBroadcast: false, type: 'scheduled' };
  assert.throws(
    () => withWindow(root, { chat: scheduled }, () => getCurrentTarget()),
    error => error.code === 'UNSUPPORTED_CHAT'
  );
});

test('target detection uses synchronous mirror instead of asynchronous worker managers', () => {
  const peer = { _: 'channel', id: 55, title: 'Group', access_hash: '1234', pFlags: { megagroup: true } };
  const root = { myId: 42, managers: {
    apiManager: { invokeApi() {} },
    appPeersManager: new Proxy({}, { get: () => () => { throw new Error('Worker proxy must not be read synchronously'); } })
  } };
  withWindow(root, { chat: { peerId: -55, type: 'chat' } }, () => {
    window.apiManagerProxy = { getPeer: () => peer };
    const target = getCurrentTarget();
    assert.equal(target.kind, 'Supergroup');
    assert.deepEqual(target.inputPeer, { _: 'inputPeerChannel', channel_id: 55, access_hash: '1234' });
    assert.deepEqual(target.inputChannel, { _: 'inputChannel', channel_id: 55, access_hash: '1234' });
    assert.equal(target.selfId, 42);
  });
});

test('target detection refuses unresolved peers and incomplete mirror entries', () => {
  const root = { myId: 42, managers: makeManagers({ peer: Promise.resolve({ _: 'user' }) }) };
  withWindow(root, { chat: { peerId: 777, type: 'chat' } }, () => {
    assert.throws(() => getCurrentTarget(), { code: 'PEER_NOT_LOADED' });
    window.apiManagerProxy = { getPeer: () => ({ _: 'user', id: 777, pFlags: { min: true } }) };
    assert.throws(() => getCurrentTarget(), { code: 'PEER_NOT_LOADED' });
  });
});

test('account identity scopes target keys and every API request', async () => {
  assert.notEqual(targetKey({ peerId: 777, selfId: 42 }), targetKey({ peerId: 777, selfId: 43 }));
  let self = 42;
  let calls = 0;
  const api = new TelegramApi({ root: () => ({ myId: self, managers: {
    apiManager: { invokeApi: async () => { calls++; return {}; } }
  } }) });
  const target = { selfId: 42, isChannel: false, inputPeer: { _: 'inputPeerUser', user_id: 777 } };
  await api.deleteBatch({ target, ids: [1] });
  self = 43;
  await assert.rejects(api.deleteBatch({ target, ids: [1] }), { code: 'ACCOUNT_CHANGED', fatal: true });
  await assert.rejects(api.searchPage({ target }), { code: 'ACCOUNT_CHANGED' });
  await assert.rejects(api.historyPage({ target }), { code: 'ACCOUNT_CHANGED' });
  await assert.rejects(api.getPinnedIds({ target }), { code: 'ACCOUNT_CHANGED' });
  assert.equal(calls, 1);
});

test('incomplete pinned pagination fails closed on loops, missing results and page cap', async () => {
  for (const response of [
    () => ({ messages: [message(9)] }),
    () => ({ _: 'messages.messagesNotModified' }),
    () => ({}),
    (_, params) => ({ messages: [message((params.offset_id || 5000) - 1)] })
  ]) {
    const { api, calls } = apiWithHandler(response);
    await assert.rejects(api.getPinnedIds({ target: { inputPeer: {} } }), { code: 'PINNED_UNAVAILABLE' });
    assert(calls.length <= MAX_PINNED_PAGES);
  }
});

test('stopping during pinned lookup prevents requesting another page', async () => {
  const controller = new AbortController();
  const { api, calls } = apiWithHandler(() => {
    controller.abort();
    return { messages: [message(5)] };
  });
  await assert.rejects(api.getPinnedIds({ target: { inputPeer: {} }, signal: controller.signal }), { name: 'AbortError' });
  assert.equal(calls.length, 1);
});
