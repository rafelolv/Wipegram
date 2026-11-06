import { WipegramError } from './errors.js';
import { clamp, truncate } from './util.js';

export const MESSAGE_TYPES = [
  { value: 'all', label: 'All message types', filter: 'inputMessagesFilterEmpty' },
  { value: 'text', label: 'Text only', filter: 'inputMessagesFilterEmpty' },
  { value: 'photos', label: 'Photos', filter: 'inputMessagesFilterPhotos' },
  { value: 'videos', label: 'Videos', filter: 'inputMessagesFilterVideo' },
  { value: 'files', label: 'Files', filter: 'inputMessagesFilterDocument' },
  { value: 'links', label: 'Links', filter: 'inputMessagesFilterUrl' },
  { value: 'music', label: 'Music', filter: 'inputMessagesFilterMusic' },
  { value: 'voice', label: 'Voice messages', filter: 'inputMessagesFilterVoice' },
  { value: 'gifs', label: 'GIFs', filter: 'inputMessagesFilterGif' }
];

const TYPE_VALUES = new Set(MESSAGE_TYPES.map(type => type.value));

export function typeLabel(value) {
  return MESSAGE_TYPES.find(type => type.value === value)?.label || 'All message types';
}

export function mtFilterForType(type) {
  const definition = MESSAGE_TYPES.find(item => item.value === type) || MESSAGE_TYPES[0];
  return { _: definition.filter };
}

export function normalizeFilters(raw = {}, target = {}) {
  if (raw.includeOthers === true && (!target.canDeleteOthers || target.includeOthers !== true)) {
    throw new WipegramError('MODERATION_FORBIDDEN', 'Enable admin mode in a group or channel where you can delete messages.');
  }
  let pattern = '';
  let patternRegex = null;
  if (typeof raw.pattern === 'string' && raw.pattern.trim()) {
    pattern = raw.pattern.trim();
    try {
      patternRegex = new RegExp(pattern, 'i');
    } catch (error) {
      throw new WipegramError('INVALID_FILTER', `Invalid regular expression: ${error.message}`, { cause: error });
    }
  }

  const filters = {
    includeOthers: raw.includeOthers === true,
    query: typeof raw.query === 'string' ? raw.query.trim() : '',
    type: TYPE_VALUES.has(raw.type) ? raw.type : 'all',
    minDate: Number.isFinite(raw.minDate) && raw.minDate > 0 ? raw.minDate : null,
    maxDate: Number.isFinite(raw.maxDate) && raw.maxDate > 0 ? raw.maxDate : null,
    skipPinned: raw.skipPinned !== false,
    topicScope: !!raw.topicScope && !!target.topMsgId,
    maxMessages: clamp(Number.parseInt(raw.maxMessages, 10) || 0, 0, 1_000_000),
    scanMethod: ['auto', 'search', 'history'].includes(raw.scanMethod) ? raw.scanMethod : 'auto',
    searchDelay: clamp(Number.parseInt(raw.searchDelay, 10) || 0, 0, 60_000),
    deleteDelay: clamp(Number.parseInt(raw.deleteDelay, 10) || 0, 0, 60_000),
    pattern,
    patternRegex
  };

  if (filters.minDate && filters.maxDate && filters.minDate >= filters.maxDate) {
    throw new WipegramError('INVALID_FILTER', '“Newer than” must be earlier than “Older than”.');
  }

  return filters;
}

export function describeFilters(filters) {
  const parts = [];
  parts.push(filters.includeOthers ? 'Everyone — admin mode' : 'Your messages only');
  parts.push(typeLabel(filters.type));
  if (filters.query) parts.push(`contains “${truncate(filters.query, 40)}”`);
  if (filters.pattern) parts.push(`matches /${truncate(filters.pattern, 40)}/i`);
  if (filters.minDate) parts.push(`newer than ${new Date(filters.minDate).toLocaleString()}`);
  if (filters.maxDate) parts.push(`older than ${new Date(filters.maxDate).toLocaleString()}`);
  if (filters.skipPinned) parts.push('pinned skipped');
  if (filters.topicScope) parts.push('current topic only');
  if (filters.maxMessages) parts.push(`up to ${filters.maxMessages} messages`);
  return parts;
}

export function messageText(message) {
  const parts = [];
  if (message?.message) parts.push(message.message);
  const poll = message?.media?.poll;
  if (poll?.question) {
    parts.push(typeof poll.question === 'string' ? poll.question : poll.question.text || '');
  }
  const webpage = message?.media?.webpage;
  if (webpage) {
    parts.push(webpage.title || '', webpage.description || '', webpage.url || '');
  }
  return parts.filter(Boolean).join('\n').trim();
}

export function mediaKind(message) {
  const media = message?.media;
  if (!media) return 'text';
  if (media._ === 'messageMediaPhoto' || media._ === 'messageMediaPaidMedia') return 'photo';
  if (media._ === 'messageMediaWebPage') return 'link';
  if (media._ === 'messageMediaPoll') return 'poll';
  if (media._ === 'messageMediaGeo' || media._ === 'messageMediaGeoLive' || media._ === 'messageMediaVenue') return 'other';

  const document = media.document;
  if (document) {
    const attributes = Array.isArray(document.attributes) ? document.attributes : [];
    const audio = attributes.find(attribute => attribute._ === 'documentAttributeAudio');
    if (audio) return audio.pFlags?.voice ? 'voice' : 'music';
    if (attributes.some(attribute => attribute._ === 'documentAttributeAnimated')) return 'gif';
    const video = attributes.find(attribute => attribute._ === 'documentAttributeVideo');
    if (video) return 'video';
    if (attributes.some(attribute => attribute._ === 'documentAttributeSticker')) return 'sticker';
    return 'file';
  }

  return 'other';
}

export function isLinkMessage(message) {
  if (message?.media?._ === 'messageMediaWebPage') return true;
  const text = message?.message || '';
  if (/(?:https?:\/\/|www\.|t\.me\/)\S+/i.test(text)) return true;
  const entities = Array.isArray(message?.entities) ? message.entities : [];
  return entities.some(entity => entity?._ === 'messageEntityUrl' || entity?._ === 'messageEntityTextUrl');
}

export function messagePreview(message) {
  const text = messageText(message);
  if (text) return truncate(text, 180);

  switch (mediaKind(message)) {
    case 'photo': return '[Photo]';
    case 'video': {
      const attributes = message?.media?.document?.attributes || [];
      const video = attributes.find(attribute => attribute._ === 'documentAttributeVideo');
      return video?.pFlags?.round_message ? '[Video message]' : '[Video]';
    }
    case 'gif': return '[GIF]';
    case 'music': return '[Audio]';
    case 'voice': return '[Voice message]';
    case 'file': {
      const attributes = message?.media?.document?.attributes || [];
      const filename = attributes.find(attribute => attribute._ === 'documentAttributeFilename');
      return filename?.file_name ? `[File] ${truncate(filename.file_name, 60)}` : '[File]';
    }
    case 'link': return '[Link]';
    case 'poll': return '[Poll]';
    case 'sticker': return '[Sticker]';
    default: return message?.media ? '[Media]' : '';
  }
}

function matchesType(message, type) {
  const kind = mediaKind(message);
  switch (type) {
    case 'all': return true;
    case 'text': return kind === 'text' || (kind === 'link' && !!message.message);
    case 'photos': return kind === 'photo';
    case 'videos': return kind === 'video';
    case 'files': return kind === 'file';
    case 'links': return kind === 'link' || isLinkMessage(message);
    case 'music': return kind === 'music';
    case 'voice': return kind === 'voice';
    case 'gifs': return kind === 'gif';
    default: return true;
  }
}

export function isOwnMessage(message, selfUserId = 0) {
  // An explicit sender wins over `out`: anonymous/send-as posts are not
  // personally authored messages, even when Telegram marks them outgoing.
  if (message?.from_id) {
    return message.from_id._ === 'peerUser'
      && (selfUserId
        ? message.from_id.user_id === selfUserId
        : !!message.pFlags?.out);
  }
  if (message?.pFlags?.out) return true;
  return false;
}

/**
 * Local filters run for both scan modes. Search-mode type and text filters are
 * left to Telegram, because its server-side filters know the media taxonomy
 * better than a userscript ever will. History mode has to classify locally.
 */
export function localMatches(message, filters, { mode = 'search', pinnedIds, selfUserId = 0 } = {}) {
  if (!message || message._ !== 'message' || !Number.isInteger(message.id) || message.id <= 0) return false;
  if (filters.includeOthers !== true && !isOwnMessage(message, selfUserId)) return false;

  const dateMs = (message.date || 0) * 1000;
  if (filters.minDate && (!dateMs || dateMs < filters.minDate)) return false;
  if (filters.maxDate && (!dateMs || dateMs > filters.maxDate)) return false;

  if (filters.skipPinned && (message.pFlags?.pinned || pinnedIds?.has(message.id))) return false;

  if (mode === 'history') {
    if (!matchesType(message, filters.type)) return false;
    if (filters.query) {
      const haystack = messageText(message).toLocaleLowerCase();
      if (!haystack.includes(filters.query.toLocaleLowerCase())) return false;
    }
  } else if (filters.type === 'text' && !matchesType(message, 'text')) {
    return false;
  }

  if (filters.patternRegex && !filters.patternRegex.test(messageText(message))) return false;

  return true;
}

export function dateRangeFromFilters(filters) {
  return {
    from: filters.minDate,
    to: filters.maxDate
  };
}
