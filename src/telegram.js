import { WipegramError, abortError } from './errors.js';
import { midToServerId, toUnixSeconds } from './util.js';

export const PAGE_SIZE = 100;
export const MAX_PINNED_PAGES = 10;

export function peerTitle(peer) {
  if (!peer) return 'Unknown chat';
  if (peer.title) return peer.title;
  const name = [peer.first_name, peer.last_name].filter(Boolean).join(' ');
  if (name) return name;
  if (peer.username) return `@${peer.username}`;
  return 'Unknown chat';
}

export function peerUsername(peer) {
  return peer?.username || peer?.usernames?.find(username => username.active)?.username || '';
}

export function peerKind(peer, isChannel, isSaved = false) {
  if (isSaved) return 'Saved Messages';
  if (peer?._ === 'user') return peer.pFlags?.bot ? 'Bot' : 'Private chat';
  if (peer?._ === 'chat') return 'Group';
  if (peer?._ === 'channel') return peer.pFlags?.megagroup ? 'Supergroup' : 'Channel';
  return 'Chat';
}

function currentSelfId(root) {
  const myId = root?.myId;
  if (!myId) return 0;
  if (typeof myId.toUserId === 'function') return myId.toUserId();
  return Number(myId) || 0;
}

export function getCurrentTarget() {
  const root = window.rootScope;
  const managers = root?.managers;
  const apiManager = managers?.apiManager;
  if (!apiManager) {
    throw new WipegramError('NOT_READY', 'Telegram Web is still loading. Wait a moment and try again.');
  }

  const chat = window.appImManager?.chat;
  if (!chat || !chat.peerId) {
    throw new WipegramError('NO_CHAT', 'Open a chat first, then press Scan messages.');
  }

  if (chat.isPreview) {
    throw new WipegramError('UNSUPPORTED_CHAT', 'Close the chat preview before using Wipegram.');
  }

  if (!['chat', 'saved', 'discussion'].includes(chat.type)) {
    throw new WipegramError('UNSUPPORTED_CHAT', 'Open a normal chat, group or Saved Messages.');
  }

  if (chat.isBroadcast) {
    throw new WipegramError('BROADCAST_CHANNEL', 'Broadcast posts are published as the channel, so personal authorship cannot be verified. Open its discussion group or a private chat instead.');
  }

  if (chat.isMonoforum) {
    throw new WipegramError('UNSUPPORTED_CHAT', 'Direct messages to a channel are not supported yet. Open the conversation from the normal chat list.');
  }

  const peerId = chat.peerId;
  // Tab managers are worker proxies and return Promises. The page's peer
  // mirror is synchronous, so target detection never mistakes a Promise for
  // a peer or a boolean channel flag.
  const mirror = window.apiManagerProxy;
  const peer = mirror?.getPeer
    ? mirror.getPeer(peerId)
    : managers.appPeersManager.getPeer(peerId);
  if (!peer || typeof peer.then === 'function') {
    throw new WipegramError('PEER_NOT_LOADED', 'Telegram has not loaded this chat yet. Close and reopen it, then try again.');
  }

  const isChannel = peer._ === 'channel';
  let inputPeer;
  if (mirror?.getPeer) {
    if (peer._ === 'user' && peer.pFlags?.self) inputPeer = { _: 'inputPeerSelf' };
    else if (peer._ === 'chat') inputPeer = { _: 'inputPeerChat', chat_id: peer.id };
    else if (['user', 'channel'].includes(peer._) && peer.access_hash != null && !peer.pFlags?.min) {
      inputPeer = peer._ === 'user'
        ? { _: 'inputPeerUser', user_id: peer.id, access_hash: peer.access_hash }
        : { _: 'inputPeerChannel', channel_id: peer.id, access_hash: peer.access_hash };
    }
  } else {
    inputPeer = managers.appPeersManager.getInputPeerById(peerId);
  }
  if (!inputPeer || typeof inputPeer.then === 'function' || inputPeer._ === 'inputPeerEmpty') {
    throw new WipegramError('PEER_NOT_LOADED', 'Telegram has not loaded this chat yet. Close and reopen it, then try again.');
  }

  let inputChannel = null;
  if (isChannel) {
    inputChannel = { _: 'inputChannel', channel_id: peer.id, access_hash: inputPeer.access_hash };
    if (!inputChannel) {
      throw new WipegramError('PEER_NOT_LOADED', 'Telegram has not loaded this chat yet. Close and reopen it, then try again.');
    }
  }

  const selfId = currentSelfId(root);
  if (!selfId) {
    throw new WipegramError('NOT_READY', 'Telegram has not loaded your account identity yet. Wait and try again.');
  }
  const isSaved = (peer._ === 'user' && !!peer.pFlags?.self) || (selfId > 0 && peerId === selfId);

  if (isSaved && chat.threadId && chat.threadId !== peerId) {
    throw new WipegramError(
      'UNSUPPORTED_CHAT',
      'Saved conversations are not supported yet. Open Saved Messages itself before using Wipegram.'
    );
  }

  if (chat.type === 'discussion' && peer._ === 'user') {
    throw new WipegramError('UNSUPPORTED_CHAT', 'This message thread is not supported. Open a normal private chat, group or Saved Messages.');
  }

  const threadId = isSaved ? 0 : (chat.threadId || 0);

  return {
    peerId,
    peer,
    inputPeer,
    inputChannel,
    isChannel,
    isSaved,
    selfId,
    title: isSaved ? 'Saved Messages' : peerTitle(peer),
    username: isSaved ? '' : peerUsername(peer),
    kind: peerKind(peer, isChannel, isSaved),
    rawId: peer.id,
    threadId,
    topMsgId: threadId ? midToServerId(threadId) : 0,
    topicTitle: isSaved ? '' : (chat.topicTitle || ''),
    chatType: chat.type,
    isForum: isSaved ? false : !!chat.isForum
  };
}

export function targetKey(target) {
  if (!target) return '';
  return `${target.selfId || 0}:${target.peerId}:${target.threadId || 0}`;
}

function messagesOf(result) {
  const messages = Array.isArray(result?.messages) ? result.messages : [];
  return messages.filter(message => message && message._ !== 'messageEmpty');
}

export function normalizeMessagesResult(result) {
  return {
    messages: messagesOf(result),
    count: Number.isFinite(result?.count) ? result.count : 0,
    notModified: result?._ === 'messages.messagesNotModified'
  };
}

export class TelegramApi {
  constructor({ root = () => window.rootScope, app = () => window.appImManager } = {}) {
    this.getRoot = root;
    this.getApp = app;
  }

  get managers() {
    return this.getRoot()?.managers;
  }

  get apiManager() {
    return this.managers?.apiManager;
  }

  isReady() {
    return !!this.apiManager;
  }

  getCurrentTarget() {
    return getCurrentTarget();
  }

  async invoke(method, params, options = {}) {
    const { expectedSelfId, ...apiOptions } = options;
    if (expectedSelfId && currentSelfId(this.getRoot()) !== expectedSelfId) {
      throw new WipegramError('ACCOUNT_CHANGED', 'The Telegram account changed. Scan again before deleting.', { fatal: true });
    }
    const apiManager = this.apiManager;
    if (!apiManager) {
      throw new WipegramError('NOT_READY', 'Telegram Web is still loading. Wait a moment and try again.');
    }

    return apiManager.invokeApi(method, params, {
      noErrorBox: true,
      floodMaxTimeout: 0,
      ...apiOptions
    });
  }

  async searchPage({ target, query = '', filter, minDate, maxDate, offsetId = 0, limit = PAGE_SIZE }) {
    const params = {
      peer: target.inputPeer,
      q: query || '',
      from_id: { _: 'inputPeerSelf' },
      filter,
      min_date: minDate ? toUnixSeconds(minDate) - 1 : 0,
      max_date: maxDate ? toUnixSeconds(maxDate) + 1 : 0,
      offset_id: offsetId || 0,
      add_offset: 0,
      limit,
      max_id: 0,
      min_id: 0,
      hash: 0
    };

    if (target.topMsgId) params.top_msg_id = target.topMsgId;

    return normalizeMessagesResult(await this.invoke('messages.search', params, { expectedSelfId: target.selfId }));
  }

  async historyPage({ target, offsetId = 0, offsetDate = 0, limit = PAGE_SIZE }) {
    if (target.topMsgId) {
      return normalizeMessagesResult(await this.invoke('messages.getReplies', {
        peer: target.inputPeer,
        msg_id: target.topMsgId,
        offset_id: offsetId || 0,
        offset_date: offsetDate || 0,
        add_offset: 0,
        limit,
        max_id: 0,
        min_id: 0,
        hash: 0
      }, { expectedSelfId: target.selfId }));
    }

    return normalizeMessagesResult(await this.invoke('messages.getHistory', {
      peer: target.inputPeer,
      offset_id: offsetId || 0,
      offset_date: offsetDate || 0,
      add_offset: 0,
      limit,
      max_id: 0,
      min_id: 0,
      hash: 0
    }, { expectedSelfId: target.selfId }));
  }

  async getPinnedIds({ target, signal }) {
    const ids = new Set();
    let offsetId = 0;

    for (let page = 0; page < MAX_PINNED_PAGES; page++) {
      if (signal?.aborted) throw abortError();
      const params = {
        peer: target.inputPeer,
        q: '',
        filter: { _: 'inputMessagesFilterPinned' },
        min_date: 0,
        max_date: 0,
        offset_id: offsetId || 0,
        add_offset: 0,
        limit: PAGE_SIZE,
        max_id: 0,
        min_id: 0,
        hash: 0
      };

      if (target.topMsgId) params.top_msg_id = target.topMsgId;

      const raw = await this.invoke('messages.search', params, { expectedSelfId: target.selfId });
      const result = normalizeMessagesResult(raw);
      if (result.notModified || !Array.isArray(raw?.messages)) {
        throw new WipegramError('PINNED_UNAVAILABLE', 'Telegram did not return the pinned messages. Scan stopped to protect them.');
      }

      for (const message of result.messages) {
        if (message._ === 'message' && Number.isInteger(message.id)) ids.add(message.id);
      }

      if (result.messages.length === 0) return ids;
      const validIds = result.messages.map(message => message.id).filter(id => Number.isInteger(id) && id > 0);
      const nextOffset = Math.min(...validIds);
      if (!Number.isFinite(nextOffset) || (offsetId && nextOffset >= offsetId)) {
        throw new WipegramError('PINNED_UNAVAILABLE', 'Pinned-message pagination did not advance. Scan stopped to protect them.');
      }
      offsetId = nextOffset;
    }

    throw new WipegramError('PINNED_UNAVAILABLE', 'Too many pinned messages to verify safely. Narrow the scan to a topic or disable pinned protection explicitly.');
  }

  async deleteBatch({ target, ids }) {
    if (!ids.length) return null;

    if (target.isChannel) {
      if (!target.inputChannel) {
        throw new WipegramError('PEER_NOT_LOADED', 'Telegram has not loaded this chat yet. Close and reopen it, then try again.');
      }

      return this.invoke('channels.deleteMessages', {
        channel: target.inputChannel,
        id: ids
      }, { expectedSelfId: target.selfId });
    }

    return this.invoke('messages.deleteMessages', {
      revoke: true,
      id: ids
    }, { expectedSelfId: target.selfId });
  }
}

export function waitForTelegram(timeoutMs = 30_000) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const check = () => window.rootScope && window.appImManager;

    if (check()) {
      resolve();
      return;
    }

    const timer = setInterval(() => {
      if (check()) {
        clearInterval(timer);
        resolve();
      } else if (Date.now() - startedAt > timeoutMs) {
        clearInterval(timer);
        reject(new WipegramError('NOT_READY', 'Wipegram could not connect to Telegram Web. Reload the page and try again.'));
      }
    }, 250);
  });
}
