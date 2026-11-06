export class WipegramError extends Error {
  constructor(code, message, { cause, fatal = false, details } = {}) {
    super(message || code);
    this.name = 'WipegramError';
    this.code = code;
    this.fatal = fatal;
    this.details = details;
    if (cause) this.cause = cause;
  }
}

export function abortError(reason = 'stopped') {
  const error = new Error(reason);
  error.name = 'AbortError';
  error.code = 'ABORTED';
  return error;
}

export function isAbortError(error) {
  return !!error && (error.name === 'AbortError' || error.code === 'ABORTED');
}

export function errorType(error) {
  return error?.type || error?.code || error?.message || 'UNKNOWN';
}

export function errorCode(error) {
  if (typeof error?.code === 'number') return error.code;
  // Normalization keeps the RPC status in details while code becomes its type.
  return typeof error?.details?.code === 'number' ? error.details.code : 0;
}

/**
 * Telegram reports flood limits as FLOOD_WAIT_<seconds>. Some methods use
 * FLOOD_PREMIUM_WAIT_<seconds> or SLOWMODE_WAIT_<seconds>; all mean "pause".
 */
export function parseFloodWait(error) {
  const type = typeof errorType(error) === 'string' ? errorType(error) : '';
  const message = typeof error?.message === 'string' ? error.message : '';
  const match = `${type} ${message}`.match(/(?:^|[^A-Z_])(?:FLOOD|SLOWMODE|PREMIUM)_WAIT_(\d+)/i)
    || `${type} ${message}`.match(/_WAIT_(\d+)/i);
  if (!match) return 0;
  const seconds = Number(match[1]);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
}

const FATAL_TYPES = new Set([
  'MODERATION_FORBIDDEN',
  'ACCOUNT_CHANGED',
  'SESSION_REVOKED',
  'AUTH_KEY_UNREGISTERED',
  'AUTH_KEY_INVALID',
  'AUTH_KEY_DUPLICATED',
  'USER_DEACTIVATED_BAN',
  'USER_DEACTIVATED',
  'FROZEN_METHOD_INVALID',
  'CHANNEL_PRIVATE',
  'PEER_ID_INVALID',
  'CHAT_ID_INVALID',
  'CHANNEL_INVALID',
  'TAKEOUT_INVALID'
]);

export function isFatalError(error) {
  const type = errorType(error);
  return FATAL_TYPES.has(type) || (typeof type === 'string' && type.startsWith('FROZEN_'));
}

const SEARCH_FALLBACK_TYPES = new Set([
  'SEARCH_QUERY_EMPTY',
  'FROM_PEER_INVALID',
  'INPUT_FILTER_INVALID',
  'CHAT_ADMIN_REQUIRED',
  'PEER_ID_NOT_SUPPORTED',
  'MSG_ID_INVALID'
]);

export function isSearchFallbackError(error) {
  return SEARCH_FALLBACK_TYPES.has(errorType(error));
}

const TRANSIENT_PATTERNS = [
  /TIMEOUT/i,
  /CONNECTION/i,
  /NETWORK/i,
  /SERVER_ERROR/i,
  /INTERNAL/i,
  /UNAVAILABLE/i,
  /TRY_AGAIN/i,
  /MSG_WAIT_FAILED/i,
  /MSG_WAIT_TIMEOUT/i
];

export function isTransientError(error) {
  const type = errorType(error);
  if (typeof type === 'string' && TRANSIENT_PATTERNS.some(pattern => pattern.test(type))) return true;
  return errorCode(error) >= 500;
}

export function isAlreadyGoneError(error) {
  const type = errorType(error);
  return type === 'MSG_ID_INVALID'
    || type === 'MESSAGE_ID_INVALID'
    || type === 'MESSAGE_EMPTY';
}

export function isSkippedDeleteError(error) {
  const type = errorType(error);
  return type === 'MESSAGE_DELETE_FORBIDDEN'
    || type === 'CHAT_ADMIN_REQUIRED'
    || type === 'CHAT_WRITE_FORBIDDEN';
}

const MESSAGES = {
  NOT_READY: 'Telegram Web is still loading. Wait a moment and try again.',
  NO_CHAT: 'Open a chat first, then press Scan messages.',
  PEER_NOT_LOADED: 'Telegram has not loaded this chat yet. Close and reopen it, then try again.',
  UNSUPPORTED_CHAT: 'This kind of chat is not supported. Open a normal chat, group or Saved Messages.',
  BROADCAST_CHANNEL: 'Broadcast posts use the channel identity. Use its discussion group for your own comments, or explicitly enable Admin mode if you have deletion rights.',
  INVALID_FILTER: 'Check the filters and try again.',
  FLOOD_TOO_LONG: 'Telegram asked Wipegram to pause for too long. Stop here and try again later.',
  CHANNEL_PRIVATE: 'You are no longer a member of this chat, or Telegram no longer lets this session read it.',
  PEER_ID_INVALID: 'Telegram no longer recognizes this chat. Close and reopen it, then try again.',
  CHAT_ID_INVALID: 'Telegram no longer recognizes this chat. Close and reopen it, then try again.',
  CHANNEL_INVALID: 'Telegram no longer recognizes this chat. Close and reopen it, then try again.',
  CHAT_ADMIN_REQUIRED: 'This action needs admin rights in this chat.',
  MESSAGE_DELETE_FORBIDDEN: 'Telegram refused to delete one of these messages. It may be a service message or too old for this chat type.',
  MSG_ID_INVALID: 'This message no longer exists.',
  MESSAGE_ID_INVALID: 'This message no longer exists.',
  SESSION_REVOKED: 'Your Telegram session was revoked. Reload Telegram and log in again.',
  AUTH_KEY_UNREGISTERED: 'Telegram no longer recognizes this session. Reload Telegram and log in again.',
  AUTH_KEY_INVALID: 'Telegram no longer recognizes this session. Reload Telegram and log in again.',
  USER_DEACTIVATED_BAN: 'This Telegram account is restricted.',
  USER_DEACTIVATED: 'This Telegram account is no longer active.',
  FROZEN_METHOD_INVALID: 'Telegram has frozen this account, so it cannot delete messages right now.',
  SEARCH_QUERY_EMPTY: 'Telegram needs a search query for this chat. Switching to a full history scan.',
  FROM_PEER_INVALID: 'Telegram cannot filter by sender in this chat. Switching to a full history scan.',
  INPUT_FILTER_INVALID: 'This message filter is not available in this chat. Switching to a full history scan.',
  PEER_ID_NOT_SUPPORTED: 'Telegram cannot search this chat type by sender. Switching to a full history scan.',
  TAKEOUT_INVALID: 'Telegram refused the export-style request for this chat.',
  ABORTED: 'Stopped.'
};

export function humanError(error) {
  const type = errorType(error);
  if (MESSAGES[type]) return MESSAGES[type];
  if (error instanceof WipegramError) return error.message;
  if (typeof type === 'string' && type.startsWith('FLOOD_WAIT_')) {
    return `Telegram asked Wipegram to wait ${parseFloodWait(error)} seconds.`;
  }
  if (error?.message) return error.message;
  return 'Telegram returned an unexpected error.';
}

export function normalizeError(error) {
  if (error instanceof WipegramError) return error;
  if (isAbortError(error)) return new WipegramError('ABORTED', MESSAGES.ABORTED, { cause: error });
  const type = errorType(error);
  return new WipegramError(type, humanError(error), {
    cause: error,
    fatal: isFatalError(error),
    details: { code: errorCode(error), type }
  });
}
