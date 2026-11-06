// ==UserScript==
// @name         Wipegram
// @namespace    https://github.com/rafelolv/Wipegram
// @version      0.3.1
// @description  Scan, review and bulk-delete your own messages in Telegram Web K
// @author       Rafael (rafaelolv)
// @copyright    2026 Rafael (rafaelolv)
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAGuUlEQVR4nOyb709TVxjHv+fSQhloWxCKJk6dmhiBZIOpKC6hbvjCZdE44zLnlmxDX/nGvdmbLdvwT5jvpmbJlukyTcwSDUILxcQyJjAUmROSJSQoBcS240f51d6dU1tS2nPOvS1vtJfPC+695zlP0vPc5zznOc/lmKADq9X6tkrIIYWQ3SrUDYQQB20uwIvFtKqqowTkCb12EuBGIBBo01IiEpnJarc2EKJ8Te834OWEGiPyXdAfvETvF3kdeAZQ1trXHqcDb6TW3I4sgHrtAP37VfBZ8Gr0MYEUA1iLrMcJlB/pbT6yi5lwRP1wMhD4PbExJ/HBZrMdpTb5lc7xXGQfZvq2P7C8kvfPXGiuP9645AEFdnsl7dGJ7HvzyYQQUffRANnLHpRYo0IHfwXZP3hGPgj5CbGxR//QaH+aXnbCKBBUxMYcnQKFVrvtXzrvS2Ag6MowFnwW2JZDA98JopATMBh0iS+w5FkGTHQS1MGg0Oy2RqG+sBkGhUDdYaLXzTAo1APKFJoXlsGgEBVlJhr982BUCKwKDM6qAWBwDG8Ak0z4eUMD8vMtXNn5788L9SwWCxpONXBlF364gNnZ2Yx0Z2ZCuHTxolDXvn8zCnc6uLLFmQWM/NyT0i41wK5db6Kuro4r897xoqenhyurqanBmTNnuLIHfQ/g8XggQqbranHhkkgxh2DLlwdgWb+GK/Zdu89tl06Bdk+7UFZVXS2UOQ84M5Jpyd1ul1BW9NYW4eAZo9f6uO1SA7jdbqGsurpKKDt48KBQ5qyTG0CkGw6H0dzcItRzvF8plE32jWB64ClXJjXA2NgYHj0a4Mp279rNbS8vL4fdboeIUkdptE+6ul1372J6epory3+tGLaaTRDx5HKvUKa5CrQL5mtBYQG2btuW0q7l4tE+zjp+u0TX5RJ7o+NIOS3y8Cv8C4EQJtyDQl0dBhDHgeqq1GkgCprL+jj5A5XpNjU1cdsViwklh3YI9UavP6DzRxXKNQ3Q3dONyclJriw5EJaUlqCiogJasD60EKNbt7+/H+Pj41zZuvrtMNv4pUz6hQi+3/jBL46uRMgj8IJkD9AKcIkkBzuZrtsljv6Oo+LgF/hjCPOjk5ChywCiOLDx1Y3L3qSe+S/qm8n8L6wsw5rK9UK9kV/EwS+OTg/wRN2Jxx6auDDMZjNqa2uhF9aX6WjpPh5+jIEB/kpUJnn7syOT8HcMQQtdBpiamkJ3Nz/ri+cD+/bVIjeX/0HpVtOtlDbWl+kw2OCFus23uO05VguK3xF/uvRdvS/98htH92aovZ0fB6piccB5oI4rD4VCaDzXyJXFdaTZXwvf/Utp5M/JN3NlkcXI8+ivA90G8LTxP7WzyJ2XlyfM4DyeNkw8ncCfnZ0pMmdsOayvr+fq+v3+6CqUDJuMpUf4yRRjonUQ4aB4w5WIbgMMDg7C5/NxZR+dPImioiKurCnm/q2tqQZ0OBw4duyYULelhZ/62vduQsHWdRAxclk7+MVJqx7gdrdy20+fPsVtn5mZoVPndvS+TeBBZ784CxEugfuXSfL+6YFxTPX5oJe0DHA7NphkkpOaOCxuzNIYwBgaGsLw8HBKn+LiYq4uqxl0dHhT2nMda2DbvwUifNfkiU8yaRnA672D+fl53f2bkqJ/c3Mz9MI8ZmFhIaXdcXgnFBP/Z4dDCxi/8RDpkJYB2A/yer26+rI3mBw4PW0e6MXNS35o0aPkPXHwG7/5EJHZRaRD2jVB2eYoEfYG5+bmlrV1dXVFcwot2N6fFzMyLXrISNsAsiJJIk2c5CcSiUSXRS06vB3cvX+mRQ8ZaRtAViSJw3P/OG2tHmjBM/JKih4yMiqLt0uKmgye+8dh+wrm4jJcnN3fSooeMjI0gDwO8Nw/DnPt7u5uofxeb2/K3n+lRQ8ZGRlAViSRuX+ctlax3MVJtlZa9JCR8ZchUZFE5v6JfUTwih8rLXrIILYie2a+kyWsfhyFwVk1AAyOQpeRORgVFUGF5lb6qwdZhkrgU1RCDGsAoqo+9p+ime0isgGCXuoB4eswKBFErkS3V1a7rYfutN6AkVDVewF/4PXoMkhUNMJoqPiWXZY22IbygtjbZ7dLiRD1gk/BDhRlP7R2TD6OPywZIBAI3FPDkU+QxdCkj8Y99eS0379UQFh2bpDu4/8251n+Ugg5TB/NyC5CKsjRYNLByZS9QPRkZUTd//y4aXYQHUtE3fuf338jWaZ1ePozQpRv8HIfnj4X9AcvII3D0ynQb39OWjZ6l64Se1784/N4TF3dG1bVm1OBwG0tpf8BAAD//99godMAAAAGSURBVAMAUbSeMM6fwl0AAAAASUVORK5CYII=
// @homepageURL  https://github.com/rafelolv/Wipegram
// @supportURL   https://github.com/rafelolv/Wipegram/issues
// @downloadURL  https://raw.githubusercontent.com/rafelolv/Wipegram/main/wipegram.user.js
// @updateURL    https://raw.githubusercontent.com/rafelolv/Wipegram/main/wipegram.user.js
// @license      LicenseRef-Wipegram-Proprietary; https://github.com/rafelolv/Wipegram/blob/main/LICENSE
// @match        https://web.telegram.org/k/*
// @match        https://web.telegram.org/k
// @match        https://web.telegram.org/a/*
// @match        https://web.telegram.org/a
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

/*!
Wipegram Proprietary License 1.0
SPDX-License-Identifier: LicenseRef-Wipegram-Proprietary

Copyright (c) 2026 Rafael (rafaelolv). All rights reserved.

1. Scope and ownership

These terms apply to original Wipegram code, documentation and artwork
(the "Software") owned by Rafael (rafaelolv) and distributed under this
license, starting with version 0.2.2. Copyright
and all rights not expressly granted remain with the copyright holder.
Visibility of source code does not make this an open-source license.

2. Limited personal-use permission

You may download official, unmodified distributions, install them on your
own devices, and run them solely for your personal, non-commercial use to
manage messages in Telegram accounts you control. You may make only the
local copies needed for installation, execution and personal backup.
This permission is non-exclusive and non-transferable. You must preserve
copyright, attribution and license notices in every permitted copy.

3. Reserved rights and restrictions

Except for the permission above, or as required by applicable law or the
hosting platform's applicable terms, you must obtain prior written
permission from Rafael (rafaelolv) before you:

- Copy, publish, redistribute, mirror, sublicense, sell, rent or transfer
  the Software or any substantial part of it.
- Modify, adapt, translate or create derivative software from it.
- Use it commercially, offer it as a service, or bundle it with another
  product or distribution.
- Remove or alter attribution, copyright, licensing or ownership notices,
  or present Wipegram or its original material as your own creation.
- Use the Wipegram name or artwork to imply endorsement or authorization.

No patent or trademark license is granted. Inspection of publicly visible
source is permitted; it grants no additional reuse or distribution rights.

4. Earlier versions and third-party rights

These terms do not revoke permissions already granted for copies released
under the MIT License, including Wipegram v0.2.1, or restrict material to
which a recipient has independent rights under an earlier license.
Third-party material remains subject to its own copyright and license.
Nothing here overrides mandatory legal exceptions or rights granted by
the hosting platform's terms.

5. Termination

Permission under this license terminates if you breach its conditions.
After termination, stop using and delete copies covered solely by this
license, except copies you are legally entitled or required to retain.
Termination does not affect independent rights under earlier licenses.

6. Warranty and liability

TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SOFTWARE IS PROVIDED
"AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT.
THE COPYRIGHT HOLDER IS NOT LIABLE FOR CLAIMS, DAMAGES OR OTHER LIABILITY
ARISING FROM THE SOFTWARE OR ITS USE. MESSAGE DELETION MAY BE PERMANENT.
NOTHING IN THIS LICENSE EXCLUDES LIABILITY THAT CANNOT LAWFULLY BE EXCLUDED.

7. Permission requests

Contact Rafael (rafaelolv) through the official Wipegram repository:
https://github.com/rafelolv/Wipegram
Additional permissions must be granted explicitly in writing.
*/
(() => {
  // src/errors.js
  var WipegramError = class extends Error {
    constructor(code, message, { cause, fatal = false, details } = {}) {
      super(message || code);
      this.name = "WipegramError";
      this.code = code;
      this.fatal = fatal;
      this.details = details;
      if (cause) this.cause = cause;
    }
  };
  function abortError(reason = "stopped") {
    const error = new Error(reason);
    error.name = "AbortError";
    error.code = "ABORTED";
    return error;
  }
  function isAbortError(error) {
    return !!error && (error.name === "AbortError" || error.code === "ABORTED");
  }
  function errorType(error) {
    return error?.type || error?.code || error?.message || "UNKNOWN";
  }
  function errorCode(error) {
    return typeof error?.code === "number" ? error.code : 0;
  }
  function parseFloodWait(error) {
    const type = typeof errorType(error) === "string" ? errorType(error) : "";
    const message = typeof error?.message === "string" ? error.message : "";
    const match = `${type} ${message}`.match(/(?:^|[^A-Z_])(?:FLOOD|SLOWMODE|PREMIUM)_WAIT_(\d+)/i) || `${type} ${message}`.match(/_WAIT_(\d+)/i);
    if (!match) return 0;
    const seconds = Number(match[1]);
    return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  }
  var FATAL_TYPES = /* @__PURE__ */ new Set([
    "MODERATION_FORBIDDEN",
    "ACCOUNT_CHANGED",
    "SESSION_REVOKED",
    "AUTH_KEY_UNREGISTERED",
    "AUTH_KEY_INVALID",
    "AUTH_KEY_DUPLICATED",
    "USER_DEACTIVATED_BAN",
    "USER_DEACTIVATED",
    "FROZEN_METHOD_INVALID",
    "CHANNEL_PRIVATE",
    "PEER_ID_INVALID",
    "CHAT_ID_INVALID",
    "CHANNEL_INVALID",
    "TAKEOUT_INVALID"
  ]);
  function isFatalError(error) {
    const type = errorType(error);
    return FATAL_TYPES.has(type) || typeof type === "string" && type.startsWith("FROZEN_");
  }
  var SEARCH_FALLBACK_TYPES = /* @__PURE__ */ new Set([
    "SEARCH_QUERY_EMPTY",
    "FROM_PEER_INVALID",
    "INPUT_FILTER_INVALID",
    "CHAT_ADMIN_REQUIRED",
    "PEER_ID_NOT_SUPPORTED",
    "MSG_ID_INVALID"
  ]);
  function isSearchFallbackError(error) {
    return SEARCH_FALLBACK_TYPES.has(errorType(error));
  }
  var TRANSIENT_PATTERNS = [
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
  function isTransientError(error) {
    const type = errorType(error);
    if (typeof type === "string" && TRANSIENT_PATTERNS.some((pattern) => pattern.test(type))) return true;
    return errorCode(error) >= 500;
  }
  function isAlreadyGoneError(error) {
    const type = errorType(error);
    return type === "MSG_ID_INVALID" || type === "MESSAGE_ID_INVALID" || type === "MESSAGE_EMPTY";
  }
  function isSkippedDeleteError(error) {
    const type = errorType(error);
    return type === "MESSAGE_DELETE_FORBIDDEN" || type === "CHAT_ADMIN_REQUIRED" || type === "CHAT_WRITE_FORBIDDEN";
  }
  var MESSAGES = {
    NOT_READY: "Telegram Web is still loading. Wait a moment and try again.",
    NO_CHAT: "Open a chat first, then press Scan messages.",
    PEER_NOT_LOADED: "Telegram has not loaded this chat yet. Close and reopen it, then try again.",
    UNSUPPORTED_CHAT: "This kind of chat is not supported. Open a normal chat, group or Saved Messages.",
    BROADCAST_CHANNEL: "Broadcast posts use the channel identity. Use its discussion group for your own comments, or explicitly enable Admin mode if you have deletion rights.",
    INVALID_FILTER: "Check the filters and try again.",
    FLOOD_TOO_LONG: "Telegram asked Wipegram to pause for too long. Stop here and try again later.",
    CHANNEL_PRIVATE: "You are no longer a member of this chat, or Telegram no longer lets this session read it.",
    PEER_ID_INVALID: "Telegram no longer recognizes this chat. Close and reopen it, then try again.",
    CHAT_ID_INVALID: "Telegram no longer recognizes this chat. Close and reopen it, then try again.",
    CHANNEL_INVALID: "Telegram no longer recognizes this chat. Close and reopen it, then try again.",
    CHAT_ADMIN_REQUIRED: "This action needs admin rights in this chat.",
    MESSAGE_DELETE_FORBIDDEN: "Telegram refused to delete one of these messages. It may be a service message or too old for this chat type.",
    MSG_ID_INVALID: "This message no longer exists.",
    MESSAGE_ID_INVALID: "This message no longer exists.",
    SESSION_REVOKED: "Your Telegram session was revoked. Reload Telegram and log in again.",
    AUTH_KEY_UNREGISTERED: "Telegram no longer recognizes this session. Reload Telegram and log in again.",
    AUTH_KEY_INVALID: "Telegram no longer recognizes this session. Reload Telegram and log in again.",
    USER_DEACTIVATED_BAN: "This Telegram account is restricted.",
    USER_DEACTIVATED: "This Telegram account is no longer active.",
    FROZEN_METHOD_INVALID: "Telegram has frozen this account, so it cannot delete messages right now.",
    SEARCH_QUERY_EMPTY: "Telegram needs a search query for this chat. Switching to a full history scan.",
    FROM_PEER_INVALID: "Telegram cannot filter by sender in this chat. Switching to a full history scan.",
    INPUT_FILTER_INVALID: "This message filter is not available in this chat. Switching to a full history scan.",
    PEER_ID_NOT_SUPPORTED: "Telegram cannot search this chat type by sender. Switching to a full history scan.",
    TAKEOUT_INVALID: "Telegram refused the export-style request for this chat.",
    ABORTED: "Stopped."
  };
  function humanError(error) {
    const type = errorType(error);
    if (MESSAGES[type]) return MESSAGES[type];
    if (error instanceof WipegramError) return error.message;
    if (typeof type === "string" && type.startsWith("FLOOD_WAIT_")) {
      return `Telegram asked Wipegram to wait ${parseFloodWait(error)} seconds.`;
    }
    if (error?.message) return error.message;
    return "Telegram returned an unexpected error.";
  }
  function normalizeError(error) {
    if (error instanceof WipegramError) return error;
    if (isAbortError(error)) return new WipegramError("ABORTED", MESSAGES.ABORTED, { cause: error });
    const type = errorType(error);
    return new WipegramError(type, humanError(error), {
      cause: error,
      fatal: isFatalError(error),
      details: { code: errorCode(error), type }
    });
  }

  // src/util.js
  function sleep(ms, signal) {
    if (!ms || ms <= 0) {
      if (signal?.aborted) return Promise.reject(abortError());
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(abortError());
        return;
      }
      const timer = setTimeout(() => {
        cleanup();
        resolve();
      }, ms);
      const onAbort = () => {
        clearTimeout(timer);
        cleanup();
        reject(abortError());
      };
      const cleanup = () => {
        signal?.removeEventListener("abort", onAbort);
      };
      signal?.addEventListener("abort", onAbort, { once: true });
    });
  }
  function chunk(items, size) {
    const out = [];
    for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
    return out;
  }
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
  function formatNumber(value) {
    return new Intl.NumberFormat().format(Number(value) || 0);
  }
  function formatDate(ms) {
    if (!ms) return "—";
    try {
      return new Intl.DateTimeFormat(void 0, {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(new Date(ms));
    } catch {
      return new Date(ms).toLocaleDateString();
    }
  }
  function formatTime(ms = Date.now()) {
    try {
      return new Intl.DateTimeFormat(void 0, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(new Date(ms));
    } catch {
      return new Date(ms).toLocaleTimeString();
    }
  }
  function formatDuration(ms) {
    const total = Math.max(0, Math.round(Number(ms) / 1e3));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor(total % 3600 / 60);
    const seconds = total % 60;
    if (hours) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }
  function truncate(text, limit = 160) {
    const normalized = String(text ?? "").replace(/\s+/g, " ").trim();
    if (normalized.length <= limit) return normalized;
    return normalized.slice(0, Math.max(0, limit - 1)).trimEnd() + "…";
  }
  function toUnixSeconds(ms) {
    return Number.isFinite(ms) && ms > 0 ? Math.floor(ms / 1e3) : 0;
  }
  function midToServerId(mid) {
    if (!Number.isInteger(mid) || mid <= 0) return 0;
    return mid < 4294967296 ? mid : mid % 4294967296;
  }
  function downloadJson(filename, data) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2) + "\n"], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function parseLocalDateTime(value) {
    if (!value) return null;
    const ms = new Date(value).getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  // src/filters.js
  var MESSAGE_TYPES = [
    { value: "all", label: "All message types", filter: "inputMessagesFilterEmpty" },
    { value: "text", label: "Text only", filter: "inputMessagesFilterEmpty" },
    { value: "photos", label: "Photos", filter: "inputMessagesFilterPhotos" },
    { value: "videos", label: "Videos", filter: "inputMessagesFilterVideo" },
    { value: "files", label: "Files", filter: "inputMessagesFilterDocument" },
    { value: "links", label: "Links", filter: "inputMessagesFilterUrl" },
    { value: "music", label: "Music", filter: "inputMessagesFilterMusic" },
    { value: "voice", label: "Voice messages", filter: "inputMessagesFilterVoice" },
    { value: "gifs", label: "GIFs", filter: "inputMessagesFilterGif" }
  ];
  var TYPE_VALUES = new Set(MESSAGE_TYPES.map((type) => type.value));
  function typeLabel(value) {
    return MESSAGE_TYPES.find((type) => type.value === value)?.label || "All message types";
  }
  function mtFilterForType(type) {
    const definition = MESSAGE_TYPES.find((item) => item.value === type) || MESSAGE_TYPES[0];
    return { _: definition.filter };
  }
  function normalizeFilters(raw = {}, target = {}) {
    if (raw.includeOthers === true && (!target.canDeleteOthers || target.includeOthers !== true)) {
      throw new WipegramError("MODERATION_FORBIDDEN", "Enable admin mode in a group or channel where you can delete messages.");
    }
    let pattern = "";
    let patternRegex = null;
    if (typeof raw.pattern === "string" && raw.pattern.trim()) {
      pattern = raw.pattern.trim();
      try {
        patternRegex = new RegExp(pattern, "i");
      } catch (error) {
        throw new WipegramError("INVALID_FILTER", `Invalid regular expression: ${error.message}`, { cause: error });
      }
    }
    const filters = {
      includeOthers: raw.includeOthers === true,
      query: typeof raw.query === "string" ? raw.query.trim() : "",
      type: TYPE_VALUES.has(raw.type) ? raw.type : "all",
      minDate: Number.isFinite(raw.minDate) && raw.minDate > 0 ? raw.minDate : null,
      maxDate: Number.isFinite(raw.maxDate) && raw.maxDate > 0 ? raw.maxDate : null,
      skipPinned: raw.skipPinned !== false,
      topicScope: !!raw.topicScope && !!target.topMsgId,
      maxMessages: clamp(Number.parseInt(raw.maxMessages, 10) || 0, 0, 1e6),
      scanMethod: ["auto", "search", "history"].includes(raw.scanMethod) ? raw.scanMethod : "auto",
      searchDelay: clamp(Number.parseInt(raw.searchDelay, 10) || 0, 0, 6e4),
      deleteDelay: clamp(Number.parseInt(raw.deleteDelay, 10) || 0, 0, 6e4),
      pattern,
      patternRegex
    };
    if (filters.minDate && filters.maxDate && filters.minDate >= filters.maxDate) {
      throw new WipegramError("INVALID_FILTER", "“Newer than” must be earlier than “Older than”.");
    }
    return filters;
  }
  function describeFilters(filters) {
    const parts = [];
    parts.push(filters.includeOthers ? "Everyone — admin mode" : "Your messages only");
    parts.push(typeLabel(filters.type));
    if (filters.query) parts.push(`contains “${truncate(filters.query, 40)}”`);
    if (filters.pattern) parts.push(`matches /${truncate(filters.pattern, 40)}/i`);
    if (filters.minDate) parts.push(`newer than ${new Date(filters.minDate).toLocaleString()}`);
    if (filters.maxDate) parts.push(`older than ${new Date(filters.maxDate).toLocaleString()}`);
    if (filters.skipPinned) parts.push("pinned skipped");
    if (filters.topicScope) parts.push("current topic only");
    if (filters.maxMessages) parts.push(`up to ${filters.maxMessages} messages`);
    return parts;
  }
  function messageText(message) {
    const parts = [];
    if (message?.message) parts.push(message.message);
    const poll = message?.media?.poll;
    if (poll?.question) {
      parts.push(typeof poll.question === "string" ? poll.question : poll.question.text || "");
    }
    const webpage = message?.media?.webpage;
    if (webpage) {
      parts.push(webpage.title || "", webpage.description || "", webpage.url || "");
    }
    return parts.filter(Boolean).join("\n").trim();
  }
  function mediaKind(message) {
    const media = message?.media;
    if (!media) return "text";
    if (media._ === "messageMediaPhoto" || media._ === "messageMediaPaidMedia") return "photo";
    if (media._ === "messageMediaWebPage") return "link";
    if (media._ === "messageMediaPoll") return "poll";
    if (media._ === "messageMediaGeo" || media._ === "messageMediaGeoLive" || media._ === "messageMediaVenue") return "other";
    const document2 = media.document;
    if (document2) {
      const attributes = Array.isArray(document2.attributes) ? document2.attributes : [];
      const audio = attributes.find((attribute) => attribute._ === "documentAttributeAudio");
      if (audio) return audio.pFlags?.voice ? "voice" : "music";
      if (attributes.some((attribute) => attribute._ === "documentAttributeAnimated")) return "gif";
      const video = attributes.find((attribute) => attribute._ === "documentAttributeVideo");
      if (video) return "video";
      if (attributes.some((attribute) => attribute._ === "documentAttributeSticker")) return "sticker";
      return "file";
    }
    return "other";
  }
  function isLinkMessage(message) {
    if (message?.media?._ === "messageMediaWebPage") return true;
    const text = message?.message || "";
    if (/(?:https?:\/\/|www\.|t\.me\/)\S+/i.test(text)) return true;
    const entities = Array.isArray(message?.entities) ? message.entities : [];
    return entities.some((entity) => entity?._ === "messageEntityUrl" || entity?._ === "messageEntityTextUrl");
  }
  function messagePreview(message) {
    const text = messageText(message);
    if (text) return truncate(text, 180);
    switch (mediaKind(message)) {
      case "photo":
        return "[Photo]";
      case "video": {
        const attributes = message?.media?.document?.attributes || [];
        const video = attributes.find((attribute) => attribute._ === "documentAttributeVideo");
        return video?.pFlags?.round_message ? "[Video message]" : "[Video]";
      }
      case "gif":
        return "[GIF]";
      case "music":
        return "[Audio]";
      case "voice":
        return "[Voice message]";
      case "file": {
        const attributes = message?.media?.document?.attributes || [];
        const filename = attributes.find((attribute) => attribute._ === "documentAttributeFilename");
        return filename?.file_name ? `[File] ${truncate(filename.file_name, 60)}` : "[File]";
      }
      case "link":
        return "[Link]";
      case "poll":
        return "[Poll]";
      case "sticker":
        return "[Sticker]";
      default:
        return message?.media ? "[Media]" : "";
    }
  }
  function matchesType(message, type) {
    const kind = mediaKind(message);
    switch (type) {
      case "all":
        return true;
      case "text":
        return kind === "text" || kind === "link" && !!message.message;
      case "photos":
        return kind === "photo";
      case "videos":
        return kind === "video";
      case "files":
        return kind === "file";
      case "links":
        return kind === "link" || isLinkMessage(message);
      case "music":
        return kind === "music";
      case "voice":
        return kind === "voice";
      case "gifs":
        return kind === "gif";
      default:
        return true;
    }
  }
  function isOwnMessage(message, selfUserId = 0) {
    if (message?.from_id) {
      return message.from_id._ === "peerUser" && (selfUserId ? message.from_id.user_id === selfUserId : !!message.pFlags?.out);
    }
    if (message?.pFlags?.out) return true;
    return false;
  }
  function localMatches(message, filters, { mode = "search", pinnedIds, selfUserId = 0 } = {}) {
    if (!message || message._ !== "message" || !Number.isInteger(message.id) || message.id <= 0) return false;
    if (filters.includeOthers !== true && !isOwnMessage(message, selfUserId)) return false;
    const dateMs = (message.date || 0) * 1e3;
    if (filters.minDate && (!dateMs || dateMs < filters.minDate)) return false;
    if (filters.maxDate && (!dateMs || dateMs > filters.maxDate)) return false;
    if (filters.skipPinned && (message.pFlags?.pinned || pinnedIds?.has(message.id))) return false;
    if (mode === "history") {
      if (!matchesType(message, filters.type)) return false;
      if (filters.query) {
        const haystack = messageText(message).toLocaleLowerCase();
        if (!haystack.includes(filters.query.toLocaleLowerCase())) return false;
      }
    } else if (filters.type === "text" && !matchesType(message, "text")) {
      return false;
    }
    if (filters.patternRegex && !filters.patternRegex.test(messageText(message))) return false;
    return true;
  }

  // src/telegram.js
  var PAGE_SIZE = 100;
  var MAX_PINNED_PAGES = 10;
  function peerTitle(peer) {
    if (!peer) return "Unknown chat";
    if (peer.title) return peer.title;
    const name = [peer.first_name, peer.last_name].filter(Boolean).join(" ");
    if (name) return name;
    if (peer.username) return `@${peer.username}`;
    return "Unknown chat";
  }
  function peerUsername(peer) {
    return peer?.username || peer?.usernames?.find((username) => username.active)?.username || "";
  }
  function peerKind(peer, isChannel, isSaved = false) {
    if (isSaved) return "Saved Messages";
    if (peer?._ === "user") return peer.pFlags?.bot ? "Bot" : "Private chat";
    if (peer?._ === "chat") return "Group";
    if (peer?._ === "channel") return peer.pFlags?.megagroup ? "Supergroup" : "Channel";
    return "Chat";
  }
  function currentSelfId(root) {
    const myId = root?.myId;
    if (!myId) return 0;
    if (typeof myId.toUserId === "function") return myId.toUserId();
    return Number(myId) || 0;
  }
  function canModerate(peer) {
    return ["chat", "channel"].includes(peer?._) && !peer.pFlags?.min && !peer.pFlags?.left && !peer.pFlags?.kicked && !peer.pFlags?.deactivated && (peer.pFlags?.creator === true || peer.admin_rights?.pFlags?.delete_messages === true);
  }
  function getCurrentTarget({
    includeOthers = false,
    root = globalThis.window?.rootScope,
    app = globalThis.window?.appImManager,
    mirror = globalThis.window?.apiManagerProxy
  } = {}) {
    if (typeof includeOthers !== "boolean") {
      throw new WipegramError("MODERATION_FORBIDDEN", "Admin mode requires an explicit boolean opt-in.", { fatal: true });
    }
    const managers = root?.managers;
    const apiManager = managers?.apiManager;
    if (!apiManager) {
      throw new WipegramError("NOT_READY", "Telegram Web is still loading. Wait a moment and try again.");
    }
    const chat = app?.chat;
    if (!chat || !chat.peerId) {
      throw new WipegramError("NO_CHAT", "Open a chat first, then press Scan messages.");
    }
    if (chat.isPreview) {
      throw new WipegramError("UNSUPPORTED_CHAT", "Close the chat preview before using Wipegram.");
    }
    if (!["chat", "saved", "discussion"].includes(chat.type)) {
      throw new WipegramError("UNSUPPORTED_CHAT", "Open a normal chat, group or Saved Messages.");
    }
    if (chat.isBroadcast && !includeOthers) {
      throw new WipegramError("BROADCAST_CHANNEL", "Broadcast posts use the channel identity. Use its discussion group for your own comments, or explicitly enable Admin mode if you have deletion rights.");
    }
    if (chat.isMonoforum) {
      throw new WipegramError("UNSUPPORTED_CHAT", "Direct messages to a channel are not supported yet. Open the conversation from the normal chat list.");
    }
    const peerId = chat.peerId;
    const peer = mirror?.getPeer ? mirror.getPeer(peerId) : managers.appPeersManager.getPeer(peerId);
    if (!peer || typeof peer.then === "function") {
      throw new WipegramError("PEER_NOT_LOADED", "Telegram has not loaded this chat yet. Close and reopen it, then try again.");
    }
    const canDeleteOthers = canModerate(peer);
    if (includeOthers && !canDeleteOthers) {
      throw new WipegramError("MODERATION_FORBIDDEN", "Admin mode requires verified owner or delete-messages permission in this group or channel.", { fatal: true });
    }
    const isChannel = peer._ === "channel";
    let inputPeer;
    if (mirror?.getPeer) {
      if (peer._ === "user" && peer.pFlags?.self) inputPeer = { _: "inputPeerSelf" };
      else if (peer._ === "chat") inputPeer = { _: "inputPeerChat", chat_id: peer.id };
      else if (["user", "channel"].includes(peer._) && peer.access_hash != null && !peer.pFlags?.min) {
        inputPeer = peer._ === "user" ? { _: "inputPeerUser", user_id: peer.id, access_hash: peer.access_hash } : { _: "inputPeerChannel", channel_id: peer.id, access_hash: peer.access_hash };
      }
    } else {
      inputPeer = managers.appPeersManager.getInputPeerById(peerId);
    }
    if (!inputPeer || typeof inputPeer.then === "function" || inputPeer._ === "inputPeerEmpty") {
      throw new WipegramError("PEER_NOT_LOADED", "Telegram has not loaded this chat yet. Close and reopen it, then try again.");
    }
    let inputChannel = null;
    if (isChannel) {
      inputChannel = { _: "inputChannel", channel_id: peer.id, access_hash: inputPeer.access_hash };
      if (!inputChannel) {
        throw new WipegramError("PEER_NOT_LOADED", "Telegram has not loaded this chat yet. Close and reopen it, then try again.");
      }
    }
    const selfId = currentSelfId(root);
    if (!selfId) {
      throw new WipegramError("NOT_READY", "Telegram has not loaded your account identity yet. Wait and try again.");
    }
    const isSaved = peer._ === "user" && !!peer.pFlags?.self || selfId > 0 && peerId === selfId;
    if (isSaved && chat.threadId && chat.threadId !== peerId) {
      throw new WipegramError(
        "UNSUPPORTED_CHAT",
        "Saved conversations are not supported yet. Open Saved Messages itself before using Wipegram."
      );
    }
    if (chat.type === "discussion" && peer._ === "user") {
      throw new WipegramError("UNSUPPORTED_CHAT", "This message thread is not supported. Open a normal private chat, group or Saved Messages.");
    }
    const threadId = isSaved ? 0 : chat.threadId || 0;
    return {
      peerId,
      peer,
      inputPeer,
      inputChannel,
      isChannel,
      isSaved,
      selfId,
      title: isSaved ? "Saved Messages" : peerTitle(peer),
      username: isSaved ? "" : peerUsername(peer),
      kind: peerKind(peer, isChannel, isSaved),
      rawId: peer.id,
      threadId,
      topMsgId: threadId ? midToServerId(threadId) : 0,
      topicTitle: isSaved ? "" : chat.topicTitle || "",
      chatType: chat.type,
      isForum: isSaved ? false : !!chat.isForum,
      canDeleteOthers,
      includeOthers: includeOthers === true
    };
  }
  function targetKey(target) {
    if (!target) return "";
    return `${target.selfId || 0}:${target.peerId}:${target.threadId || 0}:${target.includeOthers ? "everyone" : "own"}`;
  }
  function messagesOf(result) {
    const messages = Array.isArray(result?.messages) ? result.messages : [];
    return messages.filter((message) => message && message._ !== "messageEmpty");
  }
  function normalizeMessagesResult(result) {
    const rawMessages = Array.isArray(result?.messages) ? result.messages : [];
    const ids = rawMessages.map((message) => message?.id).filter((id) => Number.isInteger(id) && id > 0);
    return {
      messages: messagesOf(result),
      receivedCount: rawMessages.length,
      count: Number.isFinite(result?.count) ? result.count : 0,
      notModified: result?._ === "messages.messagesNotModified",
      nextOffsetId: ids.length ? Math.min(...ids) : 0,
      incomplete: !Array.isArray(result?.messages) || rawMessages.length > 0 && ids.length === 0
    };
  }
  var TelegramApi = class {
    constructor({
      root = () => window.rootScope,
      app = () => window.appImManager,
      mirror = () => globalThis.window?.apiManagerProxy
    } = {}) {
      this.getRoot = root;
      this.getApp = app;
      this.getMirror = mirror;
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
    getCurrentTarget(options = {}) {
      return getCurrentTarget({ ...options, root: this.getRoot(), app: this.getApp(), mirror: this.getMirror() });
    }
    async invoke(method, params, options = {}) {
      const { expectedSelfId, moderationTarget, ...apiOptions } = options;
      if (expectedSelfId && currentSelfId(this.getRoot()) !== expectedSelfId) {
        throw new WipegramError("ACCOUNT_CHANGED", "The Telegram account changed. Scan again before deleting.", { fatal: true });
      }
      if (moderationTarget) {
        let current;
        try {
          current = this.getCurrentTarget({ includeOthers: true });
        } catch {
          throw new WipegramError("MODERATION_FORBIDDEN", "Admin permission could not be verified. Scan again before deleting.", { fatal: true });
        }
        if (current.selfId !== moderationTarget.selfId || current.peerId !== moderationTarget.peerId || moderationTarget.threadId && current.threadId !== moderationTarget.threadId) {
          throw new WipegramError("MODERATION_FORBIDDEN", "Admin target or account changed. Scan again before deleting.", { fatal: true });
        }
      }
      const apiManager = this.apiManager;
      if (!apiManager) {
        throw new WipegramError("NOT_READY", "Telegram Web is still loading. Wait a moment and try again.");
      }
      try {
        return await apiManager.invokeApi(method, params, {
          noErrorBox: true,
          // The engine owns bounded retries; Web K otherwise retries 500/UNKNOWN indefinitely.
          noRetry: true,
          floodMaxTimeout: 0,
          ...apiOptions
        });
      } catch (error) {
        if (moderationTarget && ["CHAT_ADMIN_REQUIRED", "RIGHT_FORBIDDEN", "USER_NOT_PARTICIPANT"].includes(error?.type || error?.code || error?.message)) {
          throw new WipegramError("MODERATION_FORBIDDEN", "Telegram refused admin permission. Stop and verify your role before scanning again.", { fatal: true });
        }
        throw error;
      }
    }
    async searchPage({ target, query = "", filter, minDate, maxDate, offsetId = 0, limit = PAGE_SIZE }) {
      const params = {
        peer: target.inputPeer,
        q: query || "",
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
      if (!target.includeOthers) params.from_id = { _: "inputPeerSelf" };
      if (target.topMsgId) params.top_msg_id = target.topMsgId;
      return normalizeMessagesResult(await this.invoke("messages.search", params, { expectedSelfId: target.selfId, moderationTarget: target.includeOthers ? target : null }));
    }
    async historyPage({ target, offsetId = 0, offsetDate = 0, limit = PAGE_SIZE }) {
      if (target.topMsgId) {
        return normalizeMessagesResult(await this.invoke("messages.getReplies", {
          peer: target.inputPeer,
          msg_id: target.topMsgId,
          offset_id: offsetId || 0,
          offset_date: offsetDate || 0,
          add_offset: 0,
          limit,
          max_id: 0,
          min_id: 0,
          hash: 0
        }, { expectedSelfId: target.selfId, moderationTarget: target.includeOthers ? target : null }));
      }
      return normalizeMessagesResult(await this.invoke("messages.getHistory", {
        peer: target.inputPeer,
        offset_id: offsetId || 0,
        offset_date: offsetDate || 0,
        add_offset: 0,
        limit,
        max_id: 0,
        min_id: 0,
        hash: 0
      }, { expectedSelfId: target.selfId, moderationTarget: target.includeOthers ? target : null }));
    }
    async getPinnedIds({ target, signal }) {
      const ids = /* @__PURE__ */ new Set();
      let offsetId = 0;
      for (let page = 0; page < MAX_PINNED_PAGES; page++) {
        if (signal?.aborted) throw abortError();
        const params = {
          peer: target.inputPeer,
          q: "",
          filter: { _: "inputMessagesFilterPinned" },
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
        const raw = await this.invoke("messages.search", params, { expectedSelfId: target.selfId, moderationTarget: target.includeOthers ? target : null });
        const result = normalizeMessagesResult(raw);
        if (result.notModified || result.incomplete) {
          throw new WipegramError("PINNED_UNAVAILABLE", "Telegram did not return the pinned messages. Scan stopped to protect them.");
        }
        for (const message of result.messages) {
          if (message._ === "message" && Number.isInteger(message.id)) ids.add(message.id);
        }
        if (raw.messages.length === 0) return ids;
        const nextOffset = result.nextOffsetId;
        if (!Number.isFinite(nextOffset) || offsetId && nextOffset >= offsetId) {
          throw new WipegramError("PINNED_UNAVAILABLE", "Pinned-message pagination did not advance. Scan stopped to protect them.");
        }
        offsetId = nextOffset;
      }
      throw new WipegramError("PINNED_UNAVAILABLE", "Too many pinned messages to verify safely. Narrow the scan to a topic or disable pinned protection explicitly.");
    }
    async deleteBatch({ target, ids }) {
      if (!ids.length) return null;
      if (target.isChannel) {
        if (!target.inputChannel) {
          throw new WipegramError("PEER_NOT_LOADED", "Telegram has not loaded this chat yet. Close and reopen it, then try again.");
        }
        return this.invoke("channels.deleteMessages", {
          channel: target.inputChannel,
          id: ids
        }, { expectedSelfId: target.selfId, moderationTarget: target.includeOthers ? target : null });
      }
      return this.invoke("messages.deleteMessages", {
        revoke: true,
        id: ids
      }, { expectedSelfId: target.selfId, moderationTarget: target.includeOthers ? target : null });
    }
  };
  function waitForTelegram(timeoutMs = 3e4) {
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
          reject(new WipegramError("NOT_READY", "Wipegram could not connect to Telegram Web. Reload the page and try again."));
        }
      }, 250);
    });
  }

  // src/engine.js
  var DELETE_BATCH_SIZE = 100;
  var MAX_FLOOD_WAIT_SECONDS = 15 * 60;
  var MAX_FLOOD_RETRIES = 8;
  var MAX_TRANSIENT_RETRIES = 3;
  var MAX_SCAN_PAGES = 5e4;
  var MIN_SCAN_DELAY_MS = 350;
  function floodWaitError(seconds) {
    const minutes = Math.max(1, Math.ceil(seconds / 60));
    return new WipegramError(
      "FLOOD_TOO_LONG",
      `Telegram asked Wipegram to pause for ${minutes} minute${minutes === 1 ? "" : "s"}. Stop here and try again later.`,
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
      date: message.date ? message.date * 1e3 : null,
      preview: messagePreview(message),
      code: error?.code || "UNKNOWN",
      error: humanError(error)
    };
  }
  var WipegramEngine = class {
    constructor({
      api,
      onEvent = () => {
      },
      sleeper = sleep,
      batchSize = DELETE_BATCH_SIZE,
      pageSize = PAGE_SIZE,
      now = Date.now,
      retryDelay = 1e3
    } = {}) {
      if (!api) throw new Error("WipegramEngine requires an api adapter");
      this.api = api;
      this.onEvent = onEvent;
      this.sleeper = sleeper;
      this.batchSize = Math.max(1, Math.min(DELETE_BATCH_SIZE, batchSize));
      this.pageSize = Math.max(1, Math.min(100, pageSize));
      this.retryDelay = Math.max(0, retryDelay);
      this.now = now;
      this.cooldowns = /* @__PURE__ */ new Map();
    }
    emit(type, data = {}) {
      this.onEvent({ type, time: Date.now(), ...data });
    }
    checkAbort(signal) {
      if (signal?.aborted) throw normalizeError(new DOMException("Stopped", "AbortError"));
    }
    /**
     * Retry one API call. Flood waits are honoured with a sleep and reported to
     * the UI; network/5xx errors get exponential backoff. Fatal Telegram errors
     * bubble up immediately.
     */
    async retry(fn, { signal, label = "request", attempts = MAX_TRANSIENT_RETRIES, counter } = {}) {
      const group = label === "load pinned messages" || label === "search messages" ? "search" : label.startsWith("delete ") ? "delete" : label;
      let transient = 0;
      let floods = 0;
      for (; ; ) {
        this.checkAbort(signal);
        const remaining = (this.cooldowns.get(group) || 0) - this.now();
        if (remaining > 0) {
          if (remaining > MAX_FLOOD_WAIT_SECONDS * 1e3) throw floodWaitError(Math.ceil(remaining / 1e3));
          if (counter) {
            counter.count += 1;
            counter.seconds += Math.ceil(remaining / 1e3);
          }
          this.emit("flood", { seconds: Math.ceil(remaining / 1e3), until: this.cooldowns.get(group), label });
          await this.sleeper(remaining, signal);
          this.checkAbort(signal);
          this.cooldowns.delete(group);
        }
        try {
          return await fn();
        } catch (rawError) {
          const error = normalizeError(rawError);
          if (isAbortError(error)) throw error;
          if (error.fatal || isFatalError(error)) throw error;
          const wait = parseFloodWait(error);
          if (wait > 0) {
            this.cooldowns.set(group, this.now() + wait * 1e3);
            if (wait > MAX_FLOOD_WAIT_SECONDS) throw floodWaitError(wait);
            if (++floods > MAX_FLOOD_RETRIES) {
              throw new WipegramError(
                "FLOOD_TOO_LONG",
                "Telegram keeps rate-limiting this request. Stop here and try again later.",
                { fatal: true }
              );
            }
            if (counter) {
              counter.count += 1;
              counter.seconds += wait;
            }
            this.emit("flood", {
              seconds: wait,
              until: Date.now() + wait * 1e3,
              label
            });
            await this.sleeper(wait * 1e3, signal);
            this.checkAbort(signal);
            this.cooldowns.delete(group);
            continue;
          }
          if (isTransientError(error) && transient < attempts) {
            transient += 1;
            const delay = Math.min(this.retryDelay * 2 ** (transient - 1), 3e4);
            this.emit("retry", {
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
          label: "load pinned messages",
          attempts: 1,
          counter: floodCounter
        });
      } catch (rawError) {
        const error = normalizeError(rawError);
        if (isAbortError(error) || error.fatal || isFatalError(error)) throw error;
        throw new WipegramError(
          "PINNED_UNAVAILABLE",
          "Pinned messages could not be loaded, so Wipegram stopped to protect them. Uncheck “Skip pinned messages” to scan anyway.",
          { cause: error, details: { type: error.code || error.type } }
        );
      }
    }
    /**
     * Find the user's own messages in the current target.
     *
     * Search mode asks Telegram for sender=me with the chosen server-side media
     * filter. Auto also checks one recent history page for unindexed messages,
     * never the entire shared history after a successful sender search.
     */
    async scan({ target, filters, signal }) {
      if (!target) throw new WipegramError("NO_CHAT", "Open a chat first, then press Scan messages.");
      if (!filters) throw new WipegramError("INVALID_FILTER", "No filters were provided.");
      this.validateScope(target, filters);
      const startedAt = Date.now();
      const floodCounter = { count: 0, seconds: 0 };
      const matched = /* @__PURE__ */ new Map();
      const limit = filters.maxMessages || 0;
      const explicitMode = filters.scanMethod || "auto";
      let mode = explicitMode === "history" || filters.includeOthers ? "history" : "search";
      let allowFallback = explicitMode === "auto" && !filters.includeOthers;
      let offsetId = 0;
      let pages = 0;
      let scanned = 0;
      let inspected = 0;
      let verifyingRecent = false;
      let recentHistoryPages = 0;
      const checkedIds = /* @__PURE__ */ new Set();
      let totalFound = 0;
      const seenCursors = /* @__PURE__ */ new Set();
      const switchToHistory = (type, details = {}) => {
        allowFallback = false;
        verifyingRecent = type === "scan:verify";
        mode = "history";
        offsetId = 0;
        seenCursors.clear();
        this.emit(type, { ...details, matched: matched.size });
      };
      this.emit("scan:start", { target, filters, mode });
      const pinnedIds = filters.skipPinned ? await this.fetchPinnedIds(target, signal, floodCounter) : /* @__PURE__ */ new Set();
      try {
        for (; ; ) {
          this.checkAbort(signal);
          if (pages >= MAX_SCAN_PAGES) {
            throw new WipegramError("SCAN_LIMIT", "Wipegram reached its scan safety limit. Narrow the filters and try again.");
          }
          let page;
          try {
            page = mode === "search" ? await this.retry(() => this.api.searchPage({
              target,
              query: filters.query,
              filter: mtFilterForType(filters.type),
              minDate: filters.minDate,
              maxDate: filters.maxDate,
              offsetId,
              limit: this.pageSize
            }), {
              signal,
              label: "search messages",
              counter: floodCounter
            }) : await this.retry(() => this.api.historyPage({
              target,
              offsetId,
              offsetDate: 0,
              limit: this.pageSize
            }), {
              signal,
              label: "read chat history",
              counter: floodCounter
            });
          } catch (rawError) {
            const error = normalizeError(rawError);
            if (allowFallback && isSearchFallbackError(error)) {
              switchToHistory("scan:fallback", {
                reason: humanError(error),
                code: error.code || "SEARCH_UNAVAILABLE"
              });
              continue;
            }
            throw error;
          }
          this.checkAbort(signal);
          pages += 1;
          if (verifyingRecent) recentHistoryPages += 1;
          if (page.notModified || page.incomplete) {
            if (allowFallback) {
              switchToHistory("scan:fallback", {
                reason: "Telegram returned an incomplete search response.",
                code: "INCOMPLETE_RESPONSE"
              });
              continue;
            }
            throw new WipegramError("INCOMPLETE_RESPONSE", "Telegram did not return a complete message page. Scan again before deleting.");
          }
          const messages = page.messages || [];
          if (page.count && (mode === "search" || filters.includeOthers)) totalFound = Math.max(totalFound, page.count);
          inspected += page.receivedCount ?? messages.length;
          let oldestMs = 0;
          for (const message of messages) {
            if (!Number.isInteger(message?.id) || message.id <= 0) continue;
            if (message.date) {
              const ms = message.date * 1e3;
              if (!oldestMs || ms < oldestMs) oldestMs = ms;
            }
            if (message._ === "message" && (filters.includeOthers || isOwnMessage(message, target.selfId))) {
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
          this.emit("scan:progress", {
            mode,
            pages,
            scanned,
            inspected,
            matched: matched.size,
            total: totalFound,
            oldestDate: oldestMs || null
          });
          if (limit && matched.size >= limit) break;
          if (verifyingRecent) break;
          const ids = messages.map((message) => message?.id).filter((id) => Number.isInteger(id) && id > 0);
          const nextOffset = page.nextOffsetId ?? (ids.length ? Math.min(...ids) : 0);
          const reachedMinDate = filters.minDate && oldestMs && oldestMs < filters.minDate;
          const stalled = nextOffset && (offsetId && nextOffset >= offsetId || seenCursors.has(nextOffset));
          if (!nextOffset || reachedMinDate || stalled) {
            if (allowFallback) {
              switchToHistory("scan:verify", { reason: "Checking one recent history page for messages missing from sender search. Use Full history walk for older missing messages." });
              await this.sleeper(Math.max(MIN_SCAN_DELAY_MS, filters.searchDelay || 0), signal);
              continue;
            }
            if (stalled && mode === "history" && !reachedMinDate) {
              throw new WipegramError("PAGINATION_STALLED", "Telegram repeated a history page. The scan is incomplete; try again before deleting.");
            }
            break;
          }
          seenCursors.add(nextOffset);
          offsetId = nextOffset;
          await this.sleeper(Math.max(MIN_SCAN_DELAY_MS, filters.searchDelay || 0), signal);
        }
      } catch (rawError) {
        const error = normalizeError(rawError);
        if (isAbortError(error)) {
          this.emit("scan:aborted", { scanned, matched: matched.size, pages });
        }
        throw error;
      }
      if (verifyingRecent) mode = "search";
      const entries = [...matched.values()].sort((a, b) => b.id - a.id);
      const stats = {
        mode,
        pages,
        scanned,
        inspected,
        recentHistoryPages,
        matched: entries.length,
        totalFound,
        floodWaits: floodCounter.count,
        floodSeconds: floodCounter.seconds,
        durationMs: Date.now() - startedAt,
        startedAt,
        finishedAt: Date.now()
      };
      this.emit("scan:done", { target, mode, entries, stats });
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
      if (filters.includeOthers !== void 0 && typeof filters.includeOthers !== "boolean" || target.includeOthers !== void 0 && typeof target.includeOthers !== "boolean" || filters.includeOthers === true !== (target.includeOthers === true) || filters.includeOthers === true && target.canDeleteOthers !== true) {
        throw new WipegramError("MODERATION_FORBIDDEN", "Message scope changed or admin permission is unavailable. Scan again.", { fatal: true });
      }
    }
    validateCandidates(target, filters, entries) {
      this.validateScope(target, filters);
      if (entries.some((message) => message?._ !== "message" || !filters.includeOthers && !isOwnMessage(message, target.selfId))) {
        throw new WipegramError("INVALID_CANDIDATE", "A deletion candidate is outside the confirmed message scope. Scan again.", { fatal: true });
      }
    }
    async delete({ target, entries, filters = {}, signal }) {
      if (!target) throw new WipegramError("NO_CHAT", "Open a chat and scan before deleting.");
      this.validateCandidates(target, filters, entries || []);
      const startedAt = Date.now();
      const floodCounter = { count: 0, seconds: 0 };
      const unique = [...new Map((entries || []).filter((message) => Number.isInteger(message?.id) && message.id > 0).map((message) => [message.id, message])).values()];
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
      this.emit("delete:start", { target, total: unique.length });
      if (!unique.length) {
        const finished = aggregate(stats);
        this.emit("delete:done", { stats: finished, failures });
        return { stats: finished, failures };
      }
      const emitProgress = (current = null) => {
        stats.processed = stats.deleted + stats.alreadyGone + stats.skipped + stats.failed;
        this.emit("delete:progress", {
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
        const pinnedIds = filters.skipPinned ? await this.fetchPinnedIds(target, signal, floodCounter) : /* @__PURE__ */ new Set();
        const eligible = unique.filter((message) => {
          if (filters.skipPinned && (message.pFlags?.pinned || pinnedIds.has(message.id))) {
            stats.skipped += 1;
            failures.push(failureRecord(message, new WipegramError("PINNED_MESSAGE", "Message is pinned and was protected.")));
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
              return this.api.deleteBatch({ target, ids: batch.map((message) => message.id) });
            }, {
              signal,
              label: `delete batch (${batch.length} messages)`,
              counter: floodCounter
            });
            stats.deleted += batch.length;
            emitProgress(batch[batch.length - 1]);
          } catch (rawError) {
            const error = normalizeError(rawError);
            if (isAbortError(error) || error.fatal || isTransientError(error) || error.code === "FLOOD_TOO_LONG") throw error;
            batchFailed = true;
            stats.failedBatches += 1;
            this.emit("delete:warning", {
              message: `A batch of ${batch.length} messages was rejected. Retrying one by one.`,
              error: humanError(error),
              code: error.code || "BATCH_REJECTED"
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
                if (isAbortError(error) || error.fatal || isTransientError(error) || error.code === "FLOOD_TOO_LONG") throw error;
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
            code: error.code || "UNKNOWN",
            message: humanError(error),
            fatal: !!error.fatal
          };
          this.emit("delete:error", stats.error);
        }
      } finally {
        stats.floodWaits = floodCounter.count;
        stats.floodSeconds = floodCounter.seconds;
        stats.processed = stats.deleted + stats.alreadyGone + stats.skipped + stats.failed;
        stats.durationMs = Date.now() - startedAt;
        stats.finishedAt = Date.now();
      }
      this.emit("delete:done", { stats, failures });
      return { stats, failures };
    }
  };

  // src/dom.js
  function createNodes(descriptors) {
    const fragment = document.createDocumentFragment();
    for (const descriptor of descriptors) {
      if (typeof descriptor === "string") {
        fragment.appendChild(document.createTextNode(descriptor));
        continue;
      }
      const [tag, namespace, attributes, children] = descriptor;
      const element = document.createElementNS(namespace, tag);
      for (const [name, value, attributeNamespace] of attributes) {
        if (attributeNamespace) element.setAttributeNS(attributeNamespace, name, value);
        else element.setAttribute(name, value);
      }
      element.appendChild(createNodes(children));
      fragment.appendChild(element);
    }
    return fragment;
  }
  function privacyIcon(hidden) {
    const namespace = "http://www.w3.org/2000/svg";
    const paths = hidden ? [["path", [["d", "m3 3 18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7c1.4 0 2.7-.3 3.9-.8"]]]] : [["path", [["d", "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"]]], ["circle", [["cx", "12"], ["cy", "12"], ["r", "3"]]]];
    return createNodes([["svg", namespace, [
      ["class", "wg-icon"],
      ["viewBox", "0 0 24 24"],
      ["fill", "none"],
      ["stroke", "currentColor"],
      ["stroke-width", "2"],
      ["stroke-linecap", "round"],
      ["stroke-linejoin", "round"],
      ["aria-hidden", "true"]
    ], paths.map(([tag, attributes]) => [tag, namespace, attributes, []])]]);
  }

  // dom-template:src/logo.html
  var logo_default = [["svg", "http://www.w3.org/2000/svg", [["xmlns", "http://www.w3.org/2000/svg", "http://www.w3.org/2000/xmlns/"], ["viewBox", "0 0 128 128", null], ["class", "wipegram-launcher-mark", null], ["aria-hidden", "true", null]], ["\n  ", "\n  ", ["rect", "http://www.w3.org/2000/svg", [["width", "128", null], ["height", "128", null], ["rx", "28", null], ["fill", "#101211", null]], []], "\n  ", ["path", "http://www.w3.org/2000/svg", [["d", "m14 39 15 51h12l10-30 9 30h12l16-51H74l-9 30-9-30H44L35 69l-7-30Z", null], ["fill", "#e8ebe9", null]], []], "\n  ", ["path", "http://www.w3.org/2000/svg", [["d", "M103 39h15L97 90H82Z", null], ["fill", "#4ade80", null]], []], "\n"]], "\n"];

  // src/launcher.js
  var STYLE_ID = "wipegram-launcher-styles";
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
    .wipegram-launcher {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .wipegram-launcher-tile { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 8px; background: #101211; border: 1px solid #4ade80; }
    .wipegram-launcher-mark { display: block; width: 28px; height: 28px; }
    .wipegram-launcher:hover .wipegram-launcher-tile { box-shadow: 0 0 0 3px #4ade8026; }
    .wipegram-fab { position: fixed; bottom: calc(88px + env(safe-area-inset-bottom, 0px)); right: 18px; z-index: 2147482990; display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 14px 0 7px; border: 1px solid #4ade80; border-radius: 12px; background: #101211; color: #e8ebe9; box-shadow: 0 4px 18px #0004; font: 600 13px/1 system-ui, sans-serif; cursor: pointer; transition: transform 0.12s ease; }
    .wipegram-fab .wipegram-launcher-tile { border: 0; }
    .wipegram-fab:hover { transform: translateY(-2px); background: #1b1e1c; }
    .wipegram-fab:focus-visible, .wipegram-launcher:focus-visible { outline: 3px solid #4ade80; outline-offset: 3px; }
    @media (max-width: 680px) { .wipegram-fab { right: 12px; width: 44px; padding: 0; justify-content: center; } .wipegram-fab-label { display: none; } }
    @media (prefers-reduced-motion: reduce) { .wipegram-fab { transition: none; } }
  `;
    (document.head || document.documentElement).appendChild(style);
  }
  function makeGlyph() {
    const glyph = document.createElement("span");
    glyph.className = "wipegram-launcher-tile";
    glyph.setAttribute("aria-hidden", "true");
    glyph.appendChild(createNodes(logo_default));
    return glyph;
  }
  function createWipegramLauncher({ onOpen }) {
    injectStyles();
    const button = document.createElement("button");
    button.type = "button";
    button.id = "wipegram-launcher";
    button.className = "btn-icon wipegram-launcher";
    button.title = "Wipegram — delete your own messages (Alt+Shift+W)";
    button.setAttribute("aria-label", "Open Wipegram");
    button.appendChild(makeGlyph());
    const fab = document.createElement("button");
    fab.type = "button";
    fab.id = "wipegram-fab";
    fab.className = "wipegram-fab";
    fab.title = "Open Wipegram (Alt+Shift+W)";
    fab.setAttribute("aria-label", "Open Wipegram");
    fab.appendChild(makeGlyph());
    const label = document.createElement("span");
    label.className = "wipegram-fab-label";
    label.textContent = "Wipegram";
    fab.appendChild(label);
    const open = (event) => {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      onOpen(button);
    };
    button.addEventListener("click", open);
    fab.addEventListener("click", open);
    let destroyed = false;
    let scheduled = false;
    let observer = null;
    let timer = null;
    const sync = () => {
      if (destroyed || !document.body) return;
      const utils = document.querySelector(".chat-utils");
      if (utils) {
        if (!utils.contains(button)) {
          const more = utils.lastElementChild;
          utils.insertBefore(button, more && more !== button ? more : null);
        }
      } else {
        button.remove();
      }
      const chatOpen = !!window.appImManager?.chat?.peerId;
      if (chatOpen && !fab.isConnected) {
        document.body.appendChild(fab);
      } else if (!chatOpen && fab.isConnected) {
        fab.remove();
      }
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        sync();
      });
    };
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    timer = setInterval(sync, 1500);
    const onKeydown = (event) => {
      if (!event.altKey || !event.shiftKey || event.ctrlKey || event.metaKey) return;
      if (event.code !== "KeyW" && event.key.toLowerCase() !== "w") return;
      const path = event.composedPath?.() || [];
      const target = path[0] || event.target;
      if (target instanceof HTMLElement) {
        if (target.isContentEditable) return;
        if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      }
      event.preventDefault();
      event.stopPropagation();
      onOpen(button);
    };
    window.addEventListener("keydown", onKeydown, true);
    sync();
    return {
      button,
      fab,
      sync,
      destroy() {
        destroyed = true;
        observer?.disconnect();
        if (timer) clearInterval(timer);
        window.removeEventListener("keydown", onKeydown, true);
        button.remove();
        document.getElementById(STYLE_ID)?.remove();
      }
    };
  }

  // src/styles.css
  var styles_default = `:host {
  all: initial;
  --wg-panel: #f9fbfa;
  --wg-header: #ffffff;
  --wg-surface: #f0f4f1;
  --wg-input: #ffffff;
  --wg-text: #18241c;
  --wg-muted: #607166;
  --wg-placeholder: #748078;
  --wg-border: #d8e1da;
  --wg-border-strong: #b5c5ba;
  --wg-primary: #4ade80;
  --wg-primary-hover: #75e69e;
  --wg-primary-soft: rgba(74, 222, 128, .1);
  --wg-link: #20723e;
  --wg-focus: #248b4a;
  --wg-hover: rgba(48, 92, 61, .07);
  --wg-danger: #b1303d;
  --wg-danger-fill: #b43643;
  --wg-danger-soft: rgba(180, 54, 67, .08);
  --wg-danger-border: rgba(180, 54, 67, .35);
  --wg-success: #227d45;
  --wg-warning: #956314;
  --wg-shadow: 0 20px 70px rgba(10, 22, 14, .2);
  position: fixed;
  inset: 0 auto auto 0;
  width: 0;
  height: 0;
  z-index: 2147483000;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color-scheme: light;
}
:host(.wg-night) {
  --wg-panel: #101211;
  --wg-header: #101211;
  --wg-surface: #1b1e1c;
  --wg-input: #151816;
  --wg-text: #e8ebe9;
  --wg-muted: #a5afa8;
  --wg-placeholder: #7f8b82;
  --wg-border: #2d332f;
  --wg-border-strong: #455248;
  --wg-link: #86b99a;
  --wg-focus: #4ade80;
  --wg-hover: rgba(134, 185, 154, .09);
  --wg-danger: #f18d97;
  --wg-danger-soft: rgba(180, 54, 67, .15);
  --wg-danger-border: #67333a;
  --wg-success: #86b99a;
  --wg-warning: #d7b879;
  --wg-shadow: 0 24px 80px rgba(0, 0, 0, .45);
  color-scheme: dark;
}
*, *::before, *::after { box-sizing: border-box; }
[hidden], .wg-hidden { display: none !important; }
button, input, select { font: inherit; }
button, a, input, select, summary { -webkit-tap-highlight-color: transparent; }
a { color: inherit; text-decoration: none; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; }
button:focus-visible, a:focus-visible, summary:focus-visible {
  outline: 2px solid var(--wg-focus);
  outline-offset: 3px;
}
.wg-icon { width: 18px; height: 18px; flex: 0 0 auto; }
.wg-panel {
  position: fixed;
  top: 68px;
  right: 20px;
  display: flex;
  flex-direction: column;
  width: 1040px;
  max-width: calc(100vw - 40px);
  height: min(740px, calc(100vh - 96px));
  height: min(740px, calc(100dvh - 96px));
  overflow: hidden;
  border: 1px solid var(--wg-border);
  border-radius: 14px;
  background: var(--wg-panel);
  color: var(--wg-text);
  box-shadow: var(--wg-shadow);
  pointer-events: auto;
  font-size: 13px;
  line-height: 1.45;
}
.wg-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex: 0 0 auto;
  min-height: 72px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--wg-border);
  background: var(--wg-header);
  cursor: grab;
  user-select: none;
}
.wg-panel.wg-dragging .wg-header { cursor: grabbing; }
.wg-brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
.wg-brand-logo { width: 42px; height: 42px; flex: 0 0 auto; }
.wg-title { display: flex; align-items: center; gap: 10px; font-size: 22px; font-weight: 650; letter-spacing: -.5px; }
.wg-version { padding: 2px 7px; border: 1px solid var(--wg-border); border-radius: 5px; color: var(--wg-muted); font-size: 11px; font-weight: 500; letter-spacing: 0; }
.wg-subtitle { color: var(--wg-muted); font-size: 11px; }
.wg-header-actions { display: flex; align-items: center; gap: 8px; }
.wg-icon-btn {
  display: grid; place-items: center;
  width: 34px; height: 34px; padding: 0;
  border: 0; border-radius: 6px;
  background: transparent; color: var(--wg-muted);
}
.wg-icon-btn:hover:not(:disabled) { background: var(--wg-hover); color: var(--wg-text); }
.wg-icon-btn:disabled { opacity: .4; }
.wg-body { display: grid; grid-template-columns: 350px minmax(0, 1fr); flex: 1 1 auto; min-height: 0; overflow: hidden; }
.wg-controls { display: flex; flex-direction: column; min-height: 0; min-width: 0; border-right: 1px solid var(--wg-border); background: var(--wg-surface); }
.wg-controls-scroll { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 22px 20px; }
.wg-controls-scroll, .wg-review-scroll, .wg-log, .wg-modal-card { scrollbar-width: thin; scrollbar-color: var(--wg-border-strong) transparent; overscroll-behavior: contain; }
.wg-eyebrow { display: flex; align-items: center; gap: 9px; margin-bottom: 14px; font-size: 11px; font-weight: 650; letter-spacing: .12em; text-transform: uppercase; }
.wg-eyebrow::before { content: ''; width: 3px; height: 12px; border-radius: 1px; background: var(--wg-primary); }
.wg-target { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; padding: 12px 10px; border: 1px solid var(--wg-border-strong); border-radius: 8px; background: var(--wg-panel); }
.wg-avatar { display: grid; place-items: center; width: 36px; height: 36px; flex: 0 0 auto; border-radius: 7px; background: var(--wg-primary-soft); color: var(--wg-link); font-size: 17px; font-weight: 650; }
.wg-target-text { flex: 1; min-width: 0; }
.wg-target-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 650; }
.wg-target-meta { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--wg-muted); font-size: 11px; }
.wg-target .wg-icon-btn { width: 26px; height: 28px; }
.wg-alert, .wg-form-error { padding: 10px; border: 1px solid var(--wg-danger-border); border-radius: 6px; background: var(--wg-danger-soft); color: var(--wg-danger); font-size: 12px; line-height: 1.5; }
.wg-alert { margin-bottom: 16px; }
.wg-fieldset { display: flex; flex-direction: column; gap: 14px; min-width: 0; margin: 0; padding: 0; border: 0; }
.wg-fieldset:disabled { opacity: .6; }
.wg-fieldset:disabled * { pointer-events: none; }
.wg-section-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12px; font-weight: 600; }
.wg-fieldset > .wg-section-head { margin-bottom: 2px; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; }
.wg-fieldset > .wg-section-head::before { content: '/'; color: var(--wg-link); font-size: 20px; font-weight: 700; }
.wg-fieldset > .wg-section-head > span { flex: 1; }
.wg-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }
.wg-span2 { grid-column: span 2; }
.wg-dates { grid-template-columns: minmax(0, 1fr); gap: 10px; }
.wg-dates .wg-field { display: grid; grid-template-columns: 74px minmax(0, 1fr); align-items: center; gap: 10px; }
.wg-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.wg-field > span { color: var(--wg-muted); font-size: 11px; }
.wg-field input, .wg-field select { width: 100%; min-width: 0; height: 36px; padding: 0 9px; border: 1px solid var(--wg-border-strong); border-radius: 6px; outline: none; background: var(--wg-input); color: var(--wg-text); font-size: 12px; }
.wg-field input::placeholder { color: var(--wg-placeholder); }
.wg-field input:focus, .wg-field select:focus { border-color: var(--wg-focus); box-shadow: 0 0 0 2px var(--wg-primary-soft); }
.wg-field select { cursor: pointer; }
.wg-field input[type='datetime-local'] { font-size: 10.5px; }
.wg-checks { display: flex; flex-wrap: wrap; gap: 10px 16px; }
.wg-check { display: inline-flex; align-items: center; gap: 8px; color: var(--wg-text); font-size: 12px; cursor: pointer; }
.wg-check input { width: 16px; height: 16px; margin: 0; flex: 0 0 auto; accent-color: var(--wg-primary); }
.wg-advanced { border: 1px solid var(--wg-border); border-radius: 7px; }
.wg-advanced summary { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 11px; list-style: none; color: var(--wg-muted); font-size: 12px; cursor: pointer; }
.wg-advanced summary::-webkit-details-marker { display: none; }
.wg-chevron { width: 14px; height: 14px; }
.wg-advanced[open] .wg-chevron { transform: rotate(180deg); }
.wg-advanced-grid { padding: 0 11px 12px; }
.wg-fieldset > .wg-advanced-grid { padding: 0; }
.wg-advanced > .wg-check { padding: 0 11px 10px; }
.wg-hint { color: var(--wg-muted); font-size: 11px; line-height: 1.55; }
.wg-advanced .wg-hint { margin: 0; padding: 0 11px 12px; }
.wg-actions { display: flex; align-items: center; gap: 12px; }
.wg-scan-actions { padding: 16px 20px 20px; border-top: 1px solid var(--wg-border); }
.wg-btn { display: inline-flex; align-items: center; justify-content: center; gap: 9px; min-width: 0; height: 40px; padding: 0 16px; border: 1px solid transparent; border-radius: 7px; background: transparent; color: var(--wg-text); font-size: 13px; font-weight: 600; white-space: nowrap; }
.wg-btn:disabled { opacity: .45; }
.wg-primary { flex: 1; height: 46px; background: var(--wg-primary); color: #101211; }
.wg-primary:hover:not(:disabled) { background: var(--wg-primary-hover); }
.wg-stop { flex: 1; height: 46px; border-color: var(--wg-danger-border); background: var(--wg-danger-soft); color: var(--wg-danger); }
.wg-danger { border-color: var(--wg-danger-border); background: var(--wg-danger-fill); color: #fff; }
.wg-danger:hover:not(:disabled) { filter: brightness(1.1); }
.wg-danger:disabled { background: var(--wg-surface); color: var(--wg-muted); border-color: var(--wg-border); opacity: .6; }
.wg-ghost { border-color: var(--wg-border); color: var(--wg-muted); }
.wg-ghost:hover:not(:disabled) { background: var(--wg-hover); color: var(--wg-text); }
.wg-sm { height: 28px; padding: 0 9px; font-size: 11px; border-radius: 5px; }
.wg-link { border: 0; padding: 3px 0; background: none; color: var(--wg-muted); font: inherit; font-size: 11px; cursor: pointer; }
.wg-link:hover { color: var(--wg-link); }
.wg-review { display: flex; flex-direction: column; gap: 16px; min-height: 0; min-width: 0; padding: 22px 24px 20px; }
.wg-review-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.wg-review-header h2 { margin: 0; font-size: 21px; font-weight: 600; letter-spacing: -.3px; }
.wg-review-header h2::before { content: '//'; margin-right: 12px; color: var(--wg-primary); font-size: 23px; font-weight: 750; }
.wg-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); flex: 0 0 auto; padding: 16px 0; border-block: 1px solid var(--wg-border); }
.wg-metric { display: flex; flex-direction: column; padding: 0 14px; gap: 3px; border-right: 1px solid var(--wg-border); }
.wg-metric:first-child { padding-left: 0; }
.wg-metric:last-child { border-right: 0; }
.wg-metric span { order: 1; font-size: 24px; line-height: 1.2; font-weight: 600; font-variant-numeric: tabular-nums; }
.wg-metric small { color: var(--wg-muted); font-size: 10px; white-space: nowrap; }
.wg-progress-wrap { display: flex; flex: 0 0 auto; flex-direction: column; gap: 7px; }
.wg-progress { height: 3px; overflow: hidden; border-radius: 2px; background: var(--wg-border); }
.wg-progress-bar { width: 0; height: 100%; background: var(--wg-primary); transition: width .2s ease; }
.wg-progress-bar.wg-indeterminate { width: 35%; animation: wg-indeterminate 1.2s ease-in-out infinite alternate; }
.wg-status { min-height: 16px; color: var(--wg-muted); font-size: 12px; }
.wg-review-scroll { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; overflow-y: auto; }
.wg-empty { position: relative; display: grid; place-items: center; flex: 1 0 auto; min-height: 220px; overflow: hidden; text-align: center; }
.wg-empty::before, .wg-empty::after { content: ''; position: absolute; bottom: -100px; right: 2px; width: 90px; height: 340px; background: var(--wg-primary); opacity: .035; transform: skew(-28deg); pointer-events: none; }
.wg-empty::after { right: 120px; height: 260px; width: 55px; }
.wg-empty-content { position: relative; z-index: 1; padding: 20px; }
.wg-empty-logo { width: 76px; height: 76px; }
.wg-empty h3 { margin: 10px 0 8px; font-size: 24px; font-weight: 600; letter-spacing: -.4px; }
.wg-empty p { max-width: 320px; margin: 0 auto; color: var(--wg-muted); font-size: 13px; line-height: 1.6; }
.wg-results { flex: 0 0 auto; }
.wg-results > .wg-section-head { margin: 4px 0 12px; }
.wg-results-list { display: flex; flex-direction: column; }
.wg-result { padding: 12px 2px; border-bottom: 1px solid var(--wg-border); }
.wg-result-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 5px; }
.wg-result-date, .wg-badge { color: var(--wg-muted); font-size: 10px; }
.wg-result-text { display: -webkit-box; overflow: hidden; color: var(--wg-text); font-size: 12px; line-height: 1.5; overflow-wrap: anywhere; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.wg-count { color: var(--wg-muted); font-size: 11px; font-weight: 400; }
.wg-results-more { padding-top: 8px; }
.wg-activity { flex: 0 0 auto; margin-top: 12px; padding: 10px 0; border-top: 1px solid var(--wg-border); }
.wg-activity summary { color: var(--wg-muted); font-weight: 400; cursor: pointer; }
.wg-activity summary::after { content: '⌄'; }
.wg-activity summary .wg-count { margin-left: auto; }
.wg-log { display: flex; flex-direction: column; gap: 7px; max-height: 160px; overflow-y: auto; padding: 12px 0 0; font-size: 11px; line-height: 1.45; }
.wg-log-entry { display: flex; align-items: baseline; gap: 8px; }
.wg-log-time { flex: 0 0 auto; color: var(--wg-placeholder); font-size: 10px; font-variant-numeric: tabular-nums; }
.wg-log-message { color: var(--wg-muted); overflow-wrap: anywhere; }
.wg-log-success .wg-log-message { color: var(--wg-success); }
.wg-log-warning .wg-log-message { color: var(--wg-warning); }
.wg-log-error .wg-log-message { color: var(--wg-danger); }
.wg-delete-actions { flex: 0 0 auto; padding-top: 16px; border-top: 1px solid var(--wg-border); }
.wg-delete-actions .wg-btn { min-width: 170px; }
.wg-delete-hint { color: var(--wg-muted); font-size: 11px; line-height: 1.45; }
.wg-footer { display: flex; align-items: center; justify-content: space-between; flex: 0 0 auto; gap: 12px; min-height: 48px; padding: 9px 20px; border-top: 1px solid var(--wg-border); background: var(--wg-header); font-size: 11px; }
.wg-author { display: inline-flex; align-items: center; gap: 8px; }
.wg-author .wg-icon { width: 16px; height: 16px; }
.wg-author:hover { color: var(--wg-link); }
.wg-muted { color: var(--wg-muted); }
.wg-footer-actions { display: flex; align-items: center; flex-wrap: wrap; justify-content: flex-end; gap: 12px; }
.wg-license { padding: 3px 7px; border: 1px solid var(--wg-border); border-radius: 4px; }
.wg-modal { position: fixed; inset: 0; z-index: 2147483001; display: flex; align-items: center; justify-content: center; padding: 18px; background: rgba(0, 0, 0, .6); pointer-events: auto; }
.wg-modal-card { display: flex; flex-direction: column; gap: 14px; width: min(390px, 100%); max-height: calc(100vh - 36px); overflow-y: auto; padding: 24px; border: 1px solid var(--wg-border-strong); border-radius: 12px; background: var(--wg-panel); color: var(--wg-text); box-shadow: var(--wg-shadow); font-size: 13px; }
.wg-modal-card h2 { margin: 0; font-size: 20px; line-height: 1.3; }
.wg-modal-target { color: var(--wg-muted); font-size: 13px; }
.wg-modal-filters { margin: 0; padding-left: 18px; color: var(--wg-muted); font-size: 12px; }
.wg-modal-warning { margin: 0; font-size: 12px; line-height: 1.6; }
.wg-confirm-field input { height: 40px; font-weight: 600; }
.wg-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }
.wg-modal-actions .wg-btn { min-width: 96px; }
.wg-toast { position: fixed; left: 50%; bottom: 24px; z-index: 2147483002; max-width: min(420px, calc(100vw - 32px)); padding: 10px 16px; border: 1px solid #455248; border-radius: 7px; background: #1b1e1c; color: #e8ebe9; font-size: 12px; text-align: center; opacity: 0; pointer-events: none; transform: translate(-50%, 8px); transition: opacity .15s ease, transform .15s ease; }
.wg-toast.wg-show { opacity: 1; transform: translate(-50%, 0); }
.wg-toast-error { border-color: #b43643; }
.wg-toast-warning { border-color: #956314; }
:host(.wg-private) .wg-blur { filter: blur(5px); transition: filter .15s ease; }
:host(.wg-private) .wg-blur:hover { filter: none; }
#status-text[data-tone='error'] { color: var(--wg-danger); }
#status-text[data-tone='warning'] { color: var(--wg-warning); }
@keyframes wg-indeterminate { from { transform: translateX(0); } to { transform: translateX(185%); } }
@media (max-width: 950px) {
  .wg-panel { right: 12px; max-width: calc(100vw - 24px); }
  .wg-body { grid-template-columns: 290px minmax(0, 1fr); }
  .wg-review { padding: 20px; }
  .wg-metric { padding-inline: 8px; }
}
@media (max-width: 680px) {
  .wg-panel { top: 8px !important; left: 8px !important; right: 8px !important; width: auto; max-width: none; height: calc(100vh - 16px); height: calc(100dvh - 16px); border-radius: 10px; }
  .wg-header { min-height: 62px; padding: 10px 14px; cursor: default; }
  .wg-title { font-size: 19px; }
  .wg-brand-logo { width: 34px; height: 34px; }
  .wg-body { display: flex; flex-direction: column; overflow-y: auto; scrollbar-width: thin; }
  .wg-controls { flex: 0 0 auto; overflow: visible; border-right: 0; border-bottom: 1px solid var(--wg-border); }
  .wg-controls-scroll { overflow: visible; padding: 18px; }
  .wg-target { margin-bottom: 20px; }
  .wg-scan-actions { padding: 14px 18px; }
  .wg-review { flex: 0 0 auto; min-height: 440px; padding: 18px; }
  .wg-review-scroll { overflow: visible; flex: 0 0 auto; }
  .wg-results-list { max-height: 300px; overflow-y: auto; }
  .wg-empty { min-height: 230px; height: auto; }
  .wg-empty h3 { font-size: 21px; }
  .wg-metric span { font-size: 22px; }
  .wg-metric small { font-size: 10px; }
  .wg-footer { padding: 10px 14px; flex-wrap: wrap; gap: 8px; }
  .wg-footer-actions { margin-left: auto; gap: 10px; }
  .wg-delete-actions { flex-wrap: wrap; }
  .wg-delete-actions .wg-btn { min-width: 0; flex: 1; }
  .wg-delete-hint { flex: 1; min-width: 100px; }
}
@media (max-width: 360px) {
  .wg-header { gap: 8px; padding-inline: 12px; }
  .wg-brand { gap: 8px; }
  .wg-title { font-size: 17px; gap: 6px; }
  .wg-header-actions { gap: 2px; }
  .wg-grid { grid-template-columns: minmax(0, 1fr); }
  .wg-span2 { grid-column: auto; }
  .wg-author .wg-muted { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
`;

  // dom-template:src/panel.html
  var panel_default = [["div", "http://www.w3.org/1999/xhtml", [["class", "wg-panel", null], ["id", "panel", null], ["role", "dialog", null], ["aria-label", "Wipegram", null], ["tabindex", "-1", null], ["hidden", "", null]], ["\n  ", ["header", "http://www.w3.org/1999/xhtml", [["class", "wg-header", null], ["id", "drag-handle", null]], ["\n    ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-brand", null]], ["\n      ", ["svg", "http://www.w3.org/2000/svg", [["xmlns", "http://www.w3.org/2000/svg", "http://www.w3.org/2000/xmlns/"], ["viewBox", "0 0 128 128", null], ["class", "wg-brand-logo", null], ["aria-hidden", "true", null]], ["\n  ", "\n  ", ["rect", "http://www.w3.org/2000/svg", [["width", "128", null], ["height", "128", null], ["rx", "28", null], ["fill", "#101211", null]], []], "\n  ", ["path", "http://www.w3.org/2000/svg", [["d", "m14 39 15 51h12l10-30 9 30h12l16-51H74l-9 30-9-30H44L35 69l-7-30Z", null], ["fill", "#e8ebe9", null]], []], "\n  ", ["path", "http://www.w3.org/2000/svg", [["d", "M103 39h15L97 90H82Z", null], ["fill", "#4ade80", null]], []], "\n"]], "\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-brand-text", null]], ["\n        ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-title", null]], ["Wipegram ", ["span", "http://www.w3.org/1999/xhtml", [["class", "wg-version", null]], ["v0.3.1"]]]], "\n        ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-subtitle", null], ["id", "scope-label", null]], ["Your messages only"]], "\n      "]], "\n    "]], "\n    ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-header-actions", null]], ["\n      ", ["button", "http://www.w3.org/1999/xhtml", [["type", "button", null], ["class", "wg-icon-btn", null], ["id", "privacy-btn", null], ["title", "Toggle privacy mode", null], ["aria-label", "Toggle privacy mode", null], ["aria-pressed", "false", null]], [["svg", "http://www.w3.org/2000/svg", [["class", "wg-icon", null], ["viewBox", "0 0 24 24", null], ["fill", "none", null], ["stroke", "currentColor", null], ["stroke-width", "1.7", null], ["stroke-linecap", "round", null], ["stroke-linejoin", "round", null], ["aria-hidden", "true", null]], [["path", "http://www.w3.org/2000/svg", [["d", "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z", null]], []], ["circle", "http://www.w3.org/2000/svg", [["cx", "12", null], ["cy", "12", null], ["r", "3", null]], []]]]]], "\n      ", ["button", "http://www.w3.org/1999/xhtml", [["type", "button", null], ["class", "wg-icon-btn", null], ["id", "close-btn", null], ["title", "Close Wipegram", null], ["aria-label", "Close Wipegram", null]], [["svg", "http://www.w3.org/2000/svg", [["class", "wg-icon", null], ["viewBox", "0 0 24 24", null], ["fill", "none", null], ["stroke", "currentColor", null], ["stroke-width", "1.7", null], ["stroke-linecap", "round", null], ["aria-hidden", "true", null]], [["path", "http://www.w3.org/2000/svg", [["d", "m6 6 12 12M18 6 6 18", null]], []]]]]], "\n    "]], "\n  "]], "\n  ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-body", null]], ["\n    ", ["section", "http://www.w3.org/1999/xhtml", [["class", "wg-controls", null], ["aria-label", "Chat and filters", null]], ["\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-controls-scroll", null]], ["\n        ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-eyebrow", null]], ["Target"]], "\n    ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-target", null]], ["\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-avatar", null], ["id", "target-avatar", null]], ["?"]], "\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-target-text", null]], ["\n        ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-target-name wg-blur", null], ["id", "target-name", null]], ["Open a chat"]], "\n        ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-target-meta wg-blur", null], ["id", "target-meta", null]], ["Wipegram works in private chats, groups and Saved Messages"]], "\n      "]], "\n      ", ["button", "http://www.w3.org/1999/xhtml", [["type", "button", null], ["class", "wg-icon-btn", null], ["id", "refresh-btn", null], ["title", "Refresh current chat", null], ["aria-label", "Refresh current chat", null]], [["svg", "http://www.w3.org/2000/svg", [["class", "wg-icon ", null], ["viewBox", "0 0 24 24", null], ["fill", "none", null], ["stroke", "currentColor", null], ["stroke-width", "2", null], ["stroke-linecap", "round", null], ["stroke-linejoin", "round", null], ["aria-hidden", "true", null]], [["path", "http://www.w3.org/2000/svg", [["d", "M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6", null]], []]]]]], "\n    "]], "\n    ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-alert wg-hidden", null], ["id", "target-warning", null]], []], "\n\n    ", ["fieldset", "http://www.w3.org/1999/xhtml", [["class", "wg-fieldset", null], ["id", "filters-fieldset", null]], ["\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-section-head", null]], ["\n        ", ["span", "http://www.w3.org/1999/xhtml", [], ["Filters"]], "\n      "]], "\n\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-grid", null]], ["\n        ", ["label", "http://www.w3.org/1999/xhtml", [["class", "wg-field", null]], ["\n          ", ["span", "http://www.w3.org/1999/xhtml", [], ["Message type"]], "\n          ", ["select", "http://www.w3.org/1999/xhtml", [["id", "type-select", null]], [["option", "http://www.w3.org/1999/xhtml", [["value", "all", null]], ["All message types"]], ["option", "http://www.w3.org/1999/xhtml", [["value", "text", null]], ["Text only"]], ["option", "http://www.w3.org/1999/xhtml", [["value", "photos", null]], ["Photos"]], ["option", "http://www.w3.org/1999/xhtml", [["value", "videos", null]], ["Videos"]], ["option", "http://www.w3.org/1999/xhtml", [["value", "files", null]], ["Files"]], ["option", "http://www.w3.org/1999/xhtml", [["value", "links", null]], ["Links"]], ["option", "http://www.w3.org/1999/xhtml", [["value", "music", null]], ["Music"]], ["option", "http://www.w3.org/1999/xhtml", [["value", "voice", null]], ["Voice messages"]], ["option", "http://www.w3.org/1999/xhtml", [["value", "gifs", null]], ["GIFs"]]]], "\n        "]], "\n        ", ["label", "http://www.w3.org/1999/xhtml", [["class", "wg-field", null]], ["\n          ", ["span", "http://www.w3.org/1999/xhtml", [], ["Text contains"]], "\n          ", ["input", "http://www.w3.org/1999/xhtml", [["type", "text", null], ["id", "query-input", null], ["placeholder", "Optional words", null], ["autocomplete", "off", null], ["spellcheck", "false", null]], []], "\n        "]], "\n      "]], "\n\n        ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-grid wg-dates", null]], ["\n          ", ["label", "http://www.w3.org/1999/xhtml", [["class", "wg-field", null]], ["\n            ", ["span", "http://www.w3.org/1999/xhtml", [], ["Newer than"]], "\n            ", ["input", "http://www.w3.org/1999/xhtml", [["type", "datetime-local", null], ["id", "min-date", null]], []], "\n          "]], "\n          ", ["label", "http://www.w3.org/1999/xhtml", [["class", "wg-field", null]], ["\n            ", ["span", "http://www.w3.org/1999/xhtml", [], ["Older than"]], "\n            ", ["input", "http://www.w3.org/1999/xhtml", [["type", "datetime-local", null], ["id", "max-date", null]], []], "\n          "]], "\n        "]], "\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-checks", null]], ["\n        ", ["label", "http://www.w3.org/1999/xhtml", [["class", "wg-check", null]], ["\n          ", ["input", "http://www.w3.org/1999/xhtml", [["type", "checkbox", null], ["id", "skip-pinned", null], ["checked", "", null]], []], "\n          ", ["span", "http://www.w3.org/1999/xhtml", [], ["Skip pinned messages"]], "\n        "]], "\n        ", ["label", "http://www.w3.org/1999/xhtml", [["class", "wg-check", null], ["id", "topic-wrap", null], ["hidden", "", null]], ["\n          ", ["input", "http://www.w3.org/1999/xhtml", [["type", "checkbox", null], ["id", "topic-scope", null], ["checked", "", null]], []], "\n          ", ["span", "http://www.w3.org/1999/xhtml", [], ["Current topic only"]], "\n        "]], "\n      "]], "\n\n      ", ["details", "http://www.w3.org/1999/xhtml", [["class", "wg-advanced", null]], ["\n        ", ["summary", "http://www.w3.org/1999/xhtml", [], ["Admin mode ", ["svg", "http://www.w3.org/2000/svg", [["class", "wg-icon wg-chevron", null], ["viewBox", "0 0 24 24", null], ["fill", "none", null], ["stroke", "currentColor", null], ["stroke-width", "2", null], ["stroke-linecap", "round", null], ["stroke-linejoin", "round", null], ["aria-hidden", "true", null]], [["path", "http://www.w3.org/2000/svg", [["d", "m6 9 6 6 6-6", null]], []]]]]], "\n        ", ["label", "http://www.w3.org/1999/xhtml", [["class", "wg-check", null]], ["\n          ", ["input", "http://www.w3.org/1999/xhtml", [["type", "checkbox", null], ["id", "include-others", null]], []], "\n          ", ["span", "http://www.w3.org/1999/xhtml", [], ["Include everyone's messages"]], "\n        "]], "\n        ", ["p", "http://www.w3.org/1999/xhtml", [["class", "wg-hint", null]], ["Off by default. Requires group or channel owner/delete-messages permission. Deletes other people's messages only after a new scan and explicit confirmation."]], "\n      "]], "\n\n      ", ["details", "http://www.w3.org/1999/xhtml", [["class", "wg-advanced", null]], ["\n        ", ["summary", "http://www.w3.org/1999/xhtml", [], ["Advanced options ", ["svg", "http://www.w3.org/2000/svg", [["class", "wg-icon wg-chevron", null], ["viewBox", "0 0 24 24", null], ["fill", "none", null], ["stroke", "currentColor", null], ["stroke-width", "2", null], ["stroke-linecap", "round", null], ["stroke-linejoin", "round", null], ["aria-hidden", "true", null]], [["path", "http://www.w3.org/2000/svg", [["d", "m6 9 6 6 6-6", null]], []]]]]], "\n        ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-grid wg-advanced-grid", null]], ["\n          ", ["label", "http://www.w3.org/1999/xhtml", [["class", "wg-field wg-span2", null]], ["\n            ", ["span", "http://www.w3.org/1999/xhtml", [], ["Regex pattern"]], "\n            ", ["input", "http://www.w3.org/1999/xhtml", [["type", "text", null], ["id", "pattern-input", null], ["placeholder", "Optional, e.g. ^hello|invoice", null], ["autocomplete", "off", null], ["spellcheck", "false", null]], []], "\n          "]], "\n\n          ", ["label", "http://www.w3.org/1999/xhtml", [["class", "wg-field", null]], ["\n            ", ["span", "http://www.w3.org/1999/xhtml", [], ["Scan method"]], "\n            ", ["select", "http://www.w3.org/1999/xhtml", [["id", "scan-method", null]], ["\n              ", ["option", "http://www.w3.org/1999/xhtml", [["value", "auto", null]], ["Auto (recommended)"]], "\n              ", ["option", "http://www.w3.org/1999/xhtml", [["value", "search", null]], ["Telegram sender search"]], "\n              ", ["option", "http://www.w3.org/1999/xhtml", [["value", "history", null]], ["Full history walk"]], "\n            "]], "\n          "]], "\n          ", ["label", "http://www.w3.org/1999/xhtml", [["class", "wg-field", null]], ["\n            ", ["span", "http://www.w3.org/1999/xhtml", [], ["Max messages"]], "\n            ", ["input", "http://www.w3.org/1999/xhtml", [["type", "number", null], ["id", "max-messages", null], ["min", "0", null], ["step", "1", null], ["placeholder", "Unlimited", null]], []], "\n          "]], "\n          ", ["label", "http://www.w3.org/1999/xhtml", [["class", "wg-field", null]], ["\n            ", ["span", "http://www.w3.org/1999/xhtml", [], ["Pause between batches (ms)"]], "\n            ", ["input", "http://www.w3.org/1999/xhtml", [["type", "number", null], ["id", "delete-delay", null], ["min", "0", null], ["max", "60000", null], ["step", "100", null], ["value", "0", null]], []], "\n          "]], "\n          ", ["label", "http://www.w3.org/1999/xhtml", [["class", "wg-field", null]], ["\n            ", ["span", "http://www.w3.org/1999/xhtml", [], ["Pause between scan pages (ms, min. 350)"]], "\n            ", ["input", "http://www.w3.org/1999/xhtml", [["type", "number", null], ["id", "search-delay", null], ["min", "350", null], ["max", "60000", null], ["step", "50", null], ["value", "350", null]], []], "\n          "]], "\n        "]], "\n        ", ["p", "http://www.w3.org/1999/xhtml", [["class", "wg-hint", null]], ["Auto searches your messages and checks one recent history page. For older missing messages, choose Full history walk. A message limit stops the scan once reached."]], "\n      "]], "\n\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-form-error wg-hidden", null], ["id", "form-error", null]], []], "\n    "]], "\n      "]], "\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-scan-actions wg-actions", null]], ["\n      ", ["button", "http://www.w3.org/1999/xhtml", [["type", "button", null], ["class", "wg-btn wg-primary", null], ["id", "scan-btn", null]], [["svg", "http://www.w3.org/2000/svg", [["class", "wg-icon ", null], ["viewBox", "0 0 24 24", null], ["fill", "none", null], ["stroke", "currentColor", null], ["stroke-width", "2", null], ["stroke-linecap", "round", null], ["stroke-linejoin", "round", null], ["aria-hidden", "true", null]], [["circle", "http://www.w3.org/2000/svg", [["cx", "11", null], ["cy", "11", null], ["r", "7", null]], []], ["path", "http://www.w3.org/2000/svg", [["d", "m20 20-3.4-3.4", null]], []]]], ["span", "http://www.w3.org/1999/xhtml", [["id", "scan-label", null]], ["Scan messages"]]]], "\n      ", ["button", "http://www.w3.org/1999/xhtml", [["type", "button", null], ["class", "wg-btn wg-stop", null], ["id", "stop-btn", null], ["hidden", "", null]], [["svg", "http://www.w3.org/2000/svg", [["class", "wg-icon ", null], ["viewBox", "0 0 24 24", null], ["fill", "none", null], ["stroke", "currentColor", null], ["stroke-width", "2", null], ["stroke-linecap", "round", null], ["stroke-linejoin", "round", null], ["aria-hidden", "true", null]], [["rect", "http://www.w3.org/2000/svg", [["x", "6", null], ["y", "6", null], ["width", "12", null], ["height", "12", null], ["rx", "2", null], ["fill", "currentColor", null], ["stroke", "none", null]], []]]], ["span", "http://www.w3.org/1999/xhtml", [], ["Stop"]]]], "\n      "]], "\n    "]], "\n    ", ["section", "http://www.w3.org/1999/xhtml", [["class", "wg-review", null], ["aria-label", "Scan results and activity", null]], ["\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-review-header", null]], [["h2", "http://www.w3.org/1999/xhtml", [], ["Activity"]], ["button", "http://www.w3.org/1999/xhtml", [["type", "button", null], ["class", "wg-link", null], ["id", "clear-log-btn", null]], ["Clear log"]]]], "\n    ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-metrics", null]], ["\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-metric", null]], [["span", "http://www.w3.org/1999/xhtml", [["id", "metric-checked", null]], ["0"]], ["small", "http://www.w3.org/1999/xhtml", [["id", "checked-label", null]], ["Yours checked"]]]], "\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-metric", null]], [["span", "http://www.w3.org/1999/xhtml", [["id", "metric-found", null]], ["0"]], ["small", "http://www.w3.org/1999/xhtml", [], ["Found"]]]], "\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-metric", null]], [["span", "http://www.w3.org/1999/xhtml", [["id", "metric-deleted", null]], ["0"]], ["small", "http://www.w3.org/1999/xhtml", [], ["Deleted"]]]], "\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-metric", null]], [["span", "http://www.w3.org/1999/xhtml", [["id", "metric-failed", null]], ["0"]], ["small", "http://www.w3.org/1999/xhtml", [], ["Failed"]]]], "\n    "]], "\n\n\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-progress-wrap", null]], ["\n        ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-progress", null]], [["div", "http://www.w3.org/1999/xhtml", [["class", "wg-progress-bar", null], ["id", "progress-bar", null]], []]]], "\n        ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-status", null]], [["span", "http://www.w3.org/1999/xhtml", [["id", "status-text", null]], ["Choose filters, then scan the open chat."]]]], "\n      "]], "\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-review-scroll", null]], ["\n        ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-empty", null], ["id", "ready-state", null]], ["\n          ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-empty-content", null]], [["svg", "http://www.w3.org/2000/svg", [["xmlns", "http://www.w3.org/2000/svg", "http://www.w3.org/2000/xmlns/"], ["viewBox", "0 0 128 128", null], ["class", "wg-empty-logo", null], ["aria-hidden", "true", null]], ["\n  ", "\n  ", ["rect", "http://www.w3.org/2000/svg", [["width", "128", null], ["height", "128", null], ["rx", "28", null], ["fill", "#101211", null]], []], "\n  ", ["path", "http://www.w3.org/2000/svg", [["d", "m14 39 15 51h12l10-30 9 30h12l16-51H74l-9 30-9-30H44L35 69l-7-30Z", null], ["fill", "#e8ebe9", null]], []], "\n  ", ["path", "http://www.w3.org/2000/svg", [["d", "M103 39h15L97 90H82Z", null], ["fill", "#4ade80", null]], []], "\n"]], ["h3", "http://www.w3.org/1999/xhtml", [["id", "ready-title", null]], ["Ready to scan"]], ["p", "http://www.w3.org/1999/xhtml", [["id", "ready-description", null]], ["Choose your chat and filters, then scan for messages."]]]], "\n        "]], "\n    ", ["section", "http://www.w3.org/1999/xhtml", [["class", "wg-results", null], ["id", "results", null], ["hidden", "", null]], ["\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-section-head", null]], ["\n        ", ["span", "http://www.w3.org/1999/xhtml", [], ["Found messages ", ["span", "http://www.w3.org/1999/xhtml", [["class", "wg-count", null], ["id", "results-count", null]], []]]], "\n        ", ["button", "http://www.w3.org/1999/xhtml", [["type", "button", null], ["class", "wg-link", null], ["id", "results-toggle", null], ["hidden", "", null]], ["Show all"]], "\n      "]], "\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-results-list", null], ["id", "results-list", null]], []], "\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-hint wg-results-more", null], ["id", "results-more", null], ["hidden", "", null]], []], "\n    "]], "\n\n    ", ["details", "http://www.w3.org/1999/xhtml", [["class", "wg-activity", null]], ["\n      ", ["summary", "http://www.w3.org/1999/xhtml", [["class", "wg-section-head", null]], ["\n        ", ["span", "http://www.w3.org/1999/xhtml", [], ["Run log"]], "\n        ", ["span", "http://www.w3.org/1999/xhtml", [["class", "wg-count", null], ["id", "log-count", null]], ["0"]], "\n      "]], "\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-log", null], ["id", "log", null], ["role", "log", null], ["aria-live", "polite", null]], []], "\n    "]], "\n\n\n      "]], "\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-delete-actions wg-actions", null]], ["\n      ", ["button", "http://www.w3.org/1999/xhtml", [["type", "button", null], ["class", "wg-btn wg-danger", null], ["id", "delete-btn", null], ["disabled", "", null]], [["svg", "http://www.w3.org/2000/svg", [["class", "wg-icon ", null], ["viewBox", "0 0 24 24", null], ["fill", "none", null], ["stroke", "currentColor", null], ["stroke-width", "2", null], ["stroke-linecap", "round", null], ["stroke-linejoin", "round", null], ["aria-hidden", "true", null]], [["path", "http://www.w3.org/2000/svg", [["d", "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5", null]], []]]], ["span", "http://www.w3.org/1999/xhtml", [["id", "delete-label", null]], ["Delete messages"]]]], "\n        ", ["span", "http://www.w3.org/1999/xhtml", [["class", "wg-delete-hint", null]], ["Review your matches before deleting."]], "\n      "]], "\n    "]], "\n  "]], "\n  ", ["footer", "http://www.w3.org/1999/xhtml", [["class", "wg-footer", null]], ["\n    ", ["a", "http://www.w3.org/1999/xhtml", [["class", "wg-author", null], ["href", "https://github.com/rafelolv", null], ["target", "_blank", null], ["rel", "noopener noreferrer", null]], [["svg", "http://www.w3.org/2000/svg", [["class", "wg-icon", null], ["viewBox", "0 0 24 24", null], ["fill", "currentColor", null], ["aria-hidden", "true", null]], [["path", "http://www.w3.org/2000/svg", [["d", "M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.64-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.1.39-1.99 1.03-2.69-.1-.26-.45-1.28.1-2.66 0 0 .84-.27 2.75 1.03A9.6 9.6 0 0 1 12 6.8c.85 0 1.71.11 2.51.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.66.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.69-4.58 4.94.36.31.68.92.68 1.85v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z", null]], []]]], ["span", "http://www.w3.org/1999/xhtml", [], ["Rafael ", ["span", "http://www.w3.org/1999/xhtml", [["class", "wg-muted", null]], ["(rafaelolv)"]]]]]], "\n    ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-footer-actions", null]], ["\n      ", ["a", "http://www.w3.org/1999/xhtml", [["class", "wg-link wg-license", null], ["href", "https://github.com/rafelolv/Wipegram/blob/main/LICENSE", null], ["target", "_blank", null], ["rel", "noopener noreferrer", null], ["title", "Wipegram Proprietary License 1.0", null]], ["Proprietary license"]], "\n      ", ["a", "http://www.w3.org/1999/xhtml", [["class", "wg-link", null], ["href", "https://github.com/rafelolv/Wipegram/blob/main/docs/USER-GUIDE.md", null], ["target", "_blank", null], ["rel", "noopener noreferrer", null]], ["Help"]], "\n      ", ["button", "http://www.w3.org/1999/xhtml", [["type", "button", null], ["class", "wg-btn wg-ghost wg-sm", null], ["id", "reset-btn", null]], ["Reset"]], "\n      ", ["button", "http://www.w3.org/1999/xhtml", [["type", "button", null], ["class", "wg-btn wg-ghost wg-sm", null], ["id", "report-btn", null], ["disabled", "", null]], ["Report"]], "\n    "]], "\n  "]], "\n"]], "\n\n", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-modal", null], ["id", "modal", null], ["hidden", "", null]], ["\n  ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-modal-card", null], ["role", "alertdialog", null], ["aria-modal", "true", null], ["aria-labelledby", "modal-title", null], ["aria-describedby", "modal-warning", null]], ["\n    ", ["h2", "http://www.w3.org/1999/xhtml", [["id", "modal-title", null]], ["Delete messages?"]], "\n    ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-modal-target wg-blur", null], ["id", "modal-target", null]], []], "\n    ", ["ul", "http://www.w3.org/1999/xhtml", [["class", "wg-modal-filters", null], ["id", "modal-filters", null]], []], "\n    ", ["p", "http://www.w3.org/1999/xhtml", [["class", "wg-modal-warning", null], ["id", "modal-warning", null]], []], "\n    ", ["label", "http://www.w3.org/1999/xhtml", [["class", "wg-field wg-confirm-field", null], ["id", "confirm-field", null], ["hidden", "", null]], ["\n      ", ["span", "http://www.w3.org/1999/xhtml", [], ["Type ", ["strong", "http://www.w3.org/1999/xhtml", [], ["DELETE"]], " to confirm"]], "\n      ", ["input", "http://www.w3.org/1999/xhtml", [["type", "text", null], ["id", "confirm-input", null], ["autocomplete", "off", null], ["spellcheck", "false", null], ["autocapitalize", "characters", null]], []], "\n    "]], "\n    ", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-modal-actions", null]], ["\n      ", ["button", "http://www.w3.org/1999/xhtml", [["type", "button", null], ["class", "wg-btn wg-ghost", null], ["id", "confirm-cancel", null]], ["Cancel"]], "\n      ", ["button", "http://www.w3.org/1999/xhtml", [["type", "button", null], ["class", "wg-btn wg-danger", null], ["id", "confirm-delete", null]], ["Delete forever"]], "\n    "]], "\n  "]], "\n"]], "\n\n", ["div", "http://www.w3.org/1999/xhtml", [["class", "wg-toast", null], ["id", "toast", null], ["role", "status", null], ["aria-live", "polite", null], ["hidden", "", null]], []], "\n"];

  // src/ui.js
  var APP_VERSION = false ? "dev" : "0.3.1";
  var TYPE_CONFIRM_THRESHOLD = 100;
  var VISIBLE_RESULTS = 8;
  var MAX_RENDERED_RESULTS = 200;
  var MAX_LOGS = 100;
  var TYPE_BADGES = {
    text: "Text",
    photo: "Photo",
    video: "Video",
    gif: "GIF",
    music: "Audio",
    voice: "Voice",
    file: "File",
    link: "Link",
    poll: "Poll",
    sticker: "Sticker",
    other: "Media"
  };
  function initialOf(title) {
    return (title || "?").trim().charAt(0).toLocaleUpperCase() || "?";
  }
  function slugify(value) {
    return String(value || "chat").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "chat";
  }
  function dateStamp(date = /* @__PURE__ */ new Date()) {
    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
  }
  var WipegramUI = class {
    constructor({ api, engine, launcher = null } = {}) {
      this.api = api;
      this.engine = engine;
      this.launcher = launcher;
      this.launchers = launcher ? [launcher] : [];
      if (engine) {
        const previousHandler = typeof engine.onEvent === "function" ? engine.onEvent : null;
        engine.onEvent = (event) => {
          previousHandler?.(event);
          this.handleEngineEvent(event);
        };
      }
      this.host = null;
      this.shadow = null;
      this.target = null;
      this.targetError = null;
      this.targetKey = "";
      this.entries = [];
      this.scanSnapshot = null;
      this.scanStats = null;
      this.deleteStats = null;
      this.failures = [];
      this.filters = null;
      this.phase = "idle";
      this.busy = false;
      this.abortController = null;
      this.modalOpen = false;
      this.includeOthers = false;
      this.showAllResults = false;
      this.privacy = false;
      this.logs = [];
      this.pollTimer = null;
      this.toastTimer = null;
      this.themeObserver = null;
      this.drag = null;
      this.destroyed = false;
    }
    mount() {
      if (this.host || this.destroyed) return;
      this.host = document.createElement("div");
      this.host.id = "wipegram-ui";
      this.shadow = this.host.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = styles_default;
      this.shadow.append(style, createNodes(panel_default));
      (document.body || document.documentElement).appendChild(this.host);
      this.panel = this.shadow.getElementById("panel");
      this.fieldset = this.shadow.getElementById("filters-fieldset");
      this.targetName = this.shadow.getElementById("target-name");
      this.targetMeta = this.shadow.getElementById("target-meta");
      this.targetAvatar = this.shadow.getElementById("target-avatar");
      this.targetWarning = this.shadow.getElementById("target-warning");
      this.topicWrap = this.shadow.getElementById("topic-wrap");
      this.topicScope = this.shadow.getElementById("topic-scope");
      this.scanButton = this.shadow.getElementById("scan-btn");
      this.scanLabel = this.shadow.getElementById("scan-label");
      this.deleteButton = this.shadow.getElementById("delete-btn");
      this.deleteLabel = this.shadow.getElementById("delete-label");
      this.stopButton = this.shadow.getElementById("stop-btn");
      this.progressBar = this.shadow.getElementById("progress-bar");
      this.statusText = this.shadow.getElementById("status-text");
      this.metrics = this.shadow.querySelector(".wg-metrics");
      this.metricChecked = this.shadow.getElementById("metric-checked");
      this.metricFound = this.shadow.getElementById("metric-found");
      this.metricDeleted = this.shadow.getElementById("metric-deleted");
      this.metricFailed = this.shadow.getElementById("metric-failed");
      this.results = this.shadow.getElementById("results");
      this.resultsCount = this.shadow.getElementById("results-count");
      this.resultsList = this.shadow.getElementById("results-list");
      this.resultsToggle = this.shadow.getElementById("results-toggle");
      this.resultsMore = this.shadow.getElementById("results-more");
      this.formError = this.shadow.getElementById("form-error");
      this.logElement = this.shadow.getElementById("log");
      this.logCount = this.shadow.getElementById("log-count");
      this.resetButton = this.shadow.getElementById("reset-btn");
      this.reportButton = this.shadow.getElementById("report-btn");
      this.modal = this.shadow.getElementById("modal");
      this.modalTitle = this.shadow.getElementById("modal-title");
      this.modalTarget = this.shadow.getElementById("modal-target");
      this.modalFilters = this.shadow.getElementById("modal-filters");
      this.modalWarning = this.shadow.getElementById("modal-warning");
      this.confirmField = this.shadow.getElementById("confirm-field");
      this.confirmInput = this.shadow.getElementById("confirm-input");
      this.confirmDelete = this.shadow.getElementById("confirm-delete");
      this.confirmCancel = this.shadow.getElementById("confirm-cancel");
      this.toastElement = this.shadow.getElementById("toast");
      this.privacyButton = this.shadow.getElementById("privacy-btn");
      this.scopeCheckbox = this.shadow.getElementById("include-others");
      this.scopeLabel = this.shadow.getElementById("scope-label");
      this.checkedLabel = this.shadow.getElementById("checked-label");
      this.readyState = this.shadow.getElementById("ready-state");
      this.readyTitle = this.shadow.getElementById("ready-title");
      this.readyDescription = this.shadow.getElementById("ready-description");
      this.progressWrap = this.shadow.querySelector(".wg-progress-wrap");
      this.bindEvents();
      this.restorePrivacy();
      this.watchTheme();
      this.updateButtons();
      this.renderTarget();
      this.addLog("info", "Ready. Scan the open chat to preview messages.");
    }
    bindEvents() {
      this.shadow.getElementById("close-btn").addEventListener("click", () => this.close());
      this.shadow.getElementById("refresh-btn").addEventListener("click", () => this.refreshTarget({ notify: true }));
      this.privacyButton.addEventListener("click", () => this.togglePrivacy());
      this.scanButton.addEventListener("click", () => this.startScan());
      this.deleteButton.addEventListener("click", () => this.openConfirm());
      this.stopButton.addEventListener("click", () => this.abortOperation("Stopped by you."));
      this.resultsToggle.addEventListener("click", () => {
        this.showAllResults = !this.showAllResults;
        this.renderResults();
      });
      this.resetButton.addEventListener("click", () => this.resetResults());
      this.reportButton.addEventListener("click", () => this.downloadReport());
      this.confirmCancel.addEventListener("click", () => this.hideConfirm());
      this.confirmDelete.addEventListener("click", () => this.confirmDeleteMessages());
      this.confirmInput.addEventListener("input", () => this.updateConfirmState());
      this.shadow.getElementById("clear-log-btn").addEventListener("click", () => this.clearLog());
      this.scopeCheckbox.addEventListener("change", () => {
        this.includeOthers = this.scopeCheckbox.checked;
        this.hideConfirm();
        this.invalidateResults(null, { silent: true });
        this.refreshTarget({ quiet: true });
        if (this.targetError) this.showToast(this.targetError.message, "warning");
        this.setStatus("Message scope changed. Scan again before deleting.");
      });
      this.modal.addEventListener("click", (event) => {
        if (event.target === this.modal) this.hideConfirm();
      });
      const filtersChanged = () => {
        this.clearFormError();
        if (this.busy || !this.scanSnapshot) return;
        this.hideConfirm();
        this.invalidateResults("Filters changed. Scan again before deleting.");
      };
      this.fieldset.addEventListener("input", filtersChanged);
      this.fieldset.addEventListener("change", filtersChanged);
      this.onWindowKeyEvent = (event) => {
        if (!this.isOpen()) return;
        const inside = event.composedPath().includes(this.host);
        if (!inside && !this.modalOpen) return;
        if (!inside) {
          event.preventDefault();
          if (event.type === "keydown" && event.key === "Escape") this.hideConfirm();
          else this.focusConfirmation();
        } else if (event.type === "keydown") {
          this.onPanelKeydown(event);
        }
        event.stopImmediatePropagation();
      };
      for (const type of ["keydown", "keypress", "keyup"]) {
        window.addEventListener(type, this.onWindowKeyEvent, true);
      }
      this.onWindowFocusIn = (event) => {
        if (!this.isOpen()) return;
        const path = event.composedPath();
        if (this.modalOpen && !path.includes(this.modal)) {
          event.stopImmediatePropagation();
          this.focusConfirmation();
        } else if (path.includes(this.host)) {
          event.stopImmediatePropagation();
        }
      };
      window.addEventListener("focusin", this.onWindowFocusIn, true);
      document.addEventListener("keydown", this.onDocumentKeydown = (event) => {
        if (event.key === "Escape" && !this.panel.hidden) this.close();
      });
      document.addEventListener("pointerdown", this.onDocumentPointerDown = (event) => {
        if (this.panel.hidden || this.modalOpen || this.busy) return;
        const path = event.composedPath?.() || [];
        if (path.includes(this.host) || this.launchers.some((element) => path.includes(element))) return;
        this.close();
      });
      this.bindDrag();
      window.addEventListener("resize", this.onResize = () => this.clampPanel());
    }
    watchTheme() {
      const update = () => this.updateTheme();
      update();
      this.themeObserver = new MutationObserver(update);
      this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      if (document.body) {
        this.themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
      }
    }
    updateTheme() {
      const root = document.documentElement;
      const body = document.body;
      const dark = root.classList.contains("night") || root.classList.contains("tinted") || body?.classList.contains("night") || body?.classList.contains("tinted");
      this.host?.classList.toggle("wg-night", dark);
    }
    restorePrivacy() {
      try {
        this.privacy = localStorage.getItem("wipegram.privacy") === "1";
      } catch {
        this.privacy = false;
      }
      this.applyPrivacy();
    }
    togglePrivacy() {
      this.privacy = !this.privacy;
      try {
        localStorage.setItem("wipegram.privacy", this.privacy ? "1" : "0");
      } catch {
      }
      this.applyPrivacy();
    }
    applyPrivacy() {
      if (!this.host) return;
      this.host.classList.toggle("wg-private", this.privacy);
      this.privacyButton.replaceChildren(privacyIcon(this.privacy));
      this.privacyButton.setAttribute("aria-pressed", String(this.privacy));
      this.privacyButton.title = this.privacy ? "Privacy mode on" : "Privacy mode off";
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
      this.panel.classList.add("wg-open");
      this.refreshTarget({ quiet: true });
      this.startPolling();
      this.updateTheme();
      this.clampPanel();
      this.panel.focus({ preventScroll: true });
    }
    close() {
      if (!this.panel || this.panel.hidden) return;
      if (this.busy) {
        this.showToast("Stop the running operation before closing.", "warning");
        return;
      }
      this.hideConfirm();
      if (this.includeOthers) {
        this.includeOthers = false;
        this.scopeCheckbox.checked = false;
        this.invalidateResults(null, { silent: true });
      }
      this.panel.hidden = true;
      this.panel.classList.remove("wg-open");
      this.stopPolling();
      const focusTarget = this.launchers.find((element) => element?.isConnected);
      if (focusTarget) {
        try {
          focusTarget.focus({ preventScroll: true });
        } catch {
        }
      }
    }
    toggle() {
      if (this.isOpen()) this.close();
      else this.open();
    }
    startPolling() {
      this.stopPolling();
      this.pollTimer = setInterval(() => this.refreshTarget({ quiet: true }), 1200);
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
      const nextKey = target ? targetKey(target) : "";
      const changed = nextKey !== previousKey;
      this.target = target;
      this.targetError = error;
      this.targetKey = nextKey;
      this.renderTarget();
      if (changed) {
        if (this.modalOpen) this.hideConfirm();
        if (wasBusy) {
          this.abortOperation("The open chat changed, so Wipegram stopped.");
          this.showToast("Chat changed. Operation stopped.", "warning");
        } else if (this.scanSnapshot && nextKey !== this.scanSnapshot.key) {
          this.invalidateResults("The open chat changed. Scan again before deleting.");
        }
      }
      if (notify) {
        if (error) this.showToast(error.message, "warning");
        else this.showToast("Chat refreshed.", "success");
      } else if (!quiet && error) {
        this.showToast(error.message, "warning");
      }
    }
    renderTarget() {
      if (!this.panel) return;
      this.scopeLabel.textContent = this.includeOthers ? "Everyone — admin mode" : "Your messages only";
      this.checkedLabel.textContent = this.includeOthers ? "Checked" : "Yours checked";
      const target = this.target;
      const error = this.targetError;
      if (target) {
        const meta = [target.kind];
        if (target.username) meta.push(`@${target.username}`);
        if (target.topMsgId) meta.push("topic");
        else if (target.isForum) meta.push("forum");
        if (target.isSaved) meta.push("only visible to you");
        this.targetName.textContent = target.title;
        this.targetMeta.textContent = meta.join(" · ");
        this.targetAvatar.textContent = initialOf(target.title);
        this.targetAvatar.classList.remove("wg-avatar-muted");
        this.targetWarning.classList.add("wg-hidden");
        this.targetWarning.textContent = "";
        this.topicWrap.hidden = !target.topMsgId;
      } else {
        this.targetName.textContent = error?.code === "NO_CHAT" ? "No chat selected" : "Chat unavailable";
        this.targetMeta.textContent = error?.message || "Open a private chat, group or Saved Messages.";
        this.targetAvatar.textContent = "?";
        this.targetAvatar.classList.add("wg-avatar-muted");
        this.topicWrap.hidden = true;
        if (error && error.code !== "NO_CHAT") {
          this.targetWarning.textContent = error.message;
          this.targetWarning.classList.remove("wg-hidden");
        } else {
          this.targetWarning.classList.add("wg-hidden");
          this.targetWarning.textContent = "";
        }
      }
      this.updateButtons();
    }
    updateButtons() {
      if (!this.panel) return;
      const hasResults = this.entries.length > 0;
      this.fieldset.disabled = this.busy;
      this.shadow.getElementById("refresh-btn").disabled = this.busy;
      this.scanButton.hidden = this.busy;
      this.deleteButton.hidden = this.busy;
      this.stopButton.hidden = !this.busy;
      this.stopButton.disabled = false;
      this.scanButton.disabled = this.busy || !this.target;
      this.deleteButton.disabled = this.busy || !hasResults || this.phase !== "ready";
      this.deleteLabel.textContent = hasResults ? `Delete ${formatNumber(this.entries.length)} message${this.entries.length === 1 ? "" : "s"}` : "Delete messages";
      this.scanLabel.textContent = this.scanSnapshot ? "Scan again" : "Scan messages";
      this.reportButton.disabled = this.busy || !this.scanSnapshot;
      this.resetButton.disabled = this.busy;
      this.metrics.hidden = false;
      this.progressWrap.hidden = !this.busy && !this.scanSnapshot;
      this.readyState.hidden = hasResults;
      const cleanupTitle = !this.deleteStats ? "Cleanup interrupted" : this.deleteStats.error || this.deleteStats.failed ? "Cleanup finished with errors" : this.deleteStats.stopped ? "Cleanup stopped" : "Cleanup finished";
      this.readyTitle.textContent = this.busy ? this.phase === "deleting" ? "Deleting messages" : "Scan in progress" : this.phase === "done" ? cleanupTitle : this.scanSnapshot ? "No matching messages" : "Ready to scan";
      this.readyDescription.textContent = !this.target ? "Open a supported Telegram chat to get started." : this.busy ? "You can stop at any time. Review the results before deleting." : this.phase === "done" ? "Scan again to refresh remaining messages. Download a report for details." : this.scanSnapshot ? this.scanSnapshot.filters.scanMethod === "auto" ? "For older missing messages, choose Full history walk in Advanced options." : "Adjust your filters and scan again when you are ready." : "Choose your chat and filters, then scan for messages.";
      this.panel.classList.toggle("wg-ready", hasResults && this.phase === "ready");
    }
    setBusy(busy, phase = this.phase) {
      this.busy = busy;
      this.phase = phase;
      this.panel?.classList.toggle("wg-busy", busy);
      this.updateButtons();
    }
    setStatus(text, tone = "info") {
      if (!this.statusText) return;
      this.statusText.textContent = text;
      this.statusText.dataset.tone = tone;
    }
    setProgress(mode, fraction = 0) {
      if (!this.progressBar) return;
      this.progressBar.classList.remove("wg-indeterminate");
      if (mode === "indeterminate") {
        this.progressBar.classList.add("wg-indeterminate");
        this.progressBar.style.width = "100%";
        return;
      }
      const percent = mode === "determinate" ? Math.max(0, Math.min(100, fraction * 100)) : 0;
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
      const entry = document.createElement("div");
      entry.className = `wg-log-entry wg-log-${level}`;
      const time = document.createElement("span");
      time.className = "wg-log-time";
      time.textContent = formatTime();
      const text = document.createElement("span");
      text.className = "wg-log-message";
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
      if (this.logCount) this.logCount.textContent = "0";
    }
    showToast(message, tone = "info") {
      if (!this.toastElement) return;
      clearTimeout(this.toastTimer);
      this.toastElement.textContent = message;
      this.toastElement.className = `wg-toast wg-toast-${tone}`;
      this.toastElement.hidden = false;
      this.toastElement.classList.add("wg-show");
      this.toastTimer = setTimeout(() => {
        this.toastElement?.classList.remove("wg-show");
        setTimeout(() => {
          if (this.toastElement && !this.toastElement.classList.contains("wg-show")) {
            this.toastElement.hidden = true;
          }
        }, 180);
      }, 4e3);
    }
    setFormError(message) {
      this.formError.textContent = message;
      this.formError.classList.remove("wg-hidden");
    }
    clearFormError() {
      this.formError.textContent = "";
      this.formError.classList.add("wg-hidden");
    }
    readFilters() {
      const raw = {
        includeOthers: this.includeOthers,
        query: this.shadow.getElementById("query-input").value,
        pattern: this.shadow.getElementById("pattern-input").value,
        type: this.shadow.getElementById("type-select").value,
        minDate: parseLocalDateTime(this.shadow.getElementById("min-date").value),
        maxDate: parseLocalDateTime(this.shadow.getElementById("max-date").value),
        skipPinned: this.shadow.getElementById("skip-pinned").checked,
        topicScope: this.topicScope.checked && !!this.target?.topMsgId,
        maxMessages: this.shadow.getElementById("max-messages").value,
        scanMethod: this.shadow.getElementById("scan-method").value,
        deleteDelay: this.shadow.getElementById("delete-delay").value,
        searchDelay: this.shadow.getElementById("search-delay").value
      };
      return normalizeFilters(raw, this.target || {});
    }
    async startScan() {
      if (this.busy) return;
      const { target, error } = this.currentTargetInfo();
      this.target = target;
      this.targetError = error;
      this.targetKey = target ? targetKey(target) : "";
      this.renderTarget();
      if (!target) {
        this.setFormError(error?.message || "Open a chat first.");
        this.showToast(error?.message || "Open a chat first.", "warning");
        return;
      }
      let filters;
      try {
        filters = this.readFilters();
      } catch (rawError) {
        const normalized = normalizeError(rawError);
        this.setFormError(normalized.message);
        this.showToast(normalized.message, "error");
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
      this.setProgress("indeterminate");
      this.setStatus(filters.includeOthers ? "Scanning everyone’s messages — admin mode…" : "Scanning for your messages…", "info");
      this.addLog("info", `Scan started (${filters.scanMethod} mode).`);
      const scanTarget = filters.topicScope ? target : { ...target, topMsgId: 0, threadId: 0, topicTitle: "" };
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
      this.setBusy(true, "scanning");
      this.setProgress("indeterminate");
      try {
        const result = await this.engine.scan({
          target: scanTarget,
          filters,
          signal: this.abortController.signal
        });
        if (this.targetKey !== originalKey) {
          this.invalidateResults("The open chat changed during the scan. Scan again.", { silent: true });
          this.setBusy(false, "idle");
          this.showToast("The chat changed during the scan. Scan again.", "warning");
          return;
        }
        this.entries = result.entries;
        this.scanStats = result.stats;
        snapshot.entries = result.entries;
        snapshot.stats = result.stats;
        snapshot.mode = result.mode;
        this.scanSnapshot = snapshot;
        this.setBusy(false, result.entries.length ? "ready" : "idle");
        this.setProgress("determinate", 1);
        this.setMetrics({
          checked: result.stats.scanned,
          found: result.entries.length,
          deleted: 0,
          failed: 0
        });
        this.renderResults();
        this.updateButtons();
        if (result.stats.recentHistoryPages) {
          this.addLog("info", "Auto checked one recent history page. If older messages are missing, choose Full history walk in Advanced options.");
        }
        const modeText = result.mode === "history" ? "full history scan" : result.stats.recentHistoryPages ? "sender search + recent history" : "sender search";
        this.addLog("success", `Scan finished with ${formatNumber(result.entries.length)} matching message${result.entries.length === 1 ? "" : "s"} (${modeText}, ${formatDuration(result.stats.durationMs)}).`);
        if (!result.entries.length) {
          this.setStatus("No messages matched these filters.", "warning");
          this.showToast("No messages matched these filters.", "warning");
        } else {
          this.setStatus(`${formatNumber(result.entries.length)} message${result.entries.length === 1 ? "" : "s"} ready to delete.`, "success");
          this.showToast(`Found ${formatNumber(result.entries.length)} message${result.entries.length === 1 ? "" : "s"}.`, "success");
        }
      } catch (rawError) {
        const normalized = normalizeError(rawError);
        if (isAbortError(normalized)) {
          this.setStatus("Scan stopped.", "warning");
          this.addLog("warning", "Scan stopped.");
          this.showToast("Scan stopped.", "warning");
        } else {
          this.setStatus(normalized.message, "error");
          this.addLog("error", normalized.message);
          this.showToast(normalized.message, "error");
        }
        this.invalidateResults(null, { silent: true });
        this.scanSnapshot = null;
        this.setProgress(null);
        this.setBusy(false, "idle");
      } finally {
        this.abortController = null;
        this.updateButtons();
      }
    }
    openConfirm() {
      if (this.busy || !this.entries.length || !this.scanSnapshot) return;
      const current = this.currentTargetInfo();
      this.target = current.target;
      this.targetError = current.error;
      this.targetKey = current.target ? targetKey(current.target) : "";
      this.renderTarget();
      if (!current.target || this.targetKey !== this.scanSnapshot.key) {
        this.invalidateResults("The open chat changed. Scan again before deleting.");
        this.showToast("The chat changed. Scan again before deleting.", "warning");
        return;
      }
      const target = this.scanSnapshot.target;
      const count = this.entries.length;
      const requireType = count > TYPE_CONFIRM_THRESHOLD || this.scanSnapshot.filters.includeOthers === true;
      this.modalTitle.textContent = `${this.scanSnapshot.filters.includeOthers ? "Admin: delete" : "Delete"} ${formatNumber(count)} message${count === 1 ? "" : "s"}?`;
      this.modalTarget.textContent = `${target.title}${target.username ? ` (@${target.username})` : ""}`;
      const filterParts = describeFilters(this.scanSnapshot.filters);
      if (this.scanSnapshot.chat.topMsgId && !this.scanSnapshot.filters.topicScope) {
        filterParts.push("entire chat, all topics");
      }
      this.modalFilters.replaceChildren(...filterParts.map((part) => {
        const item = document.createElement("li");
        item.textContent = part;
        return item;
      }));
      this.modalWarning.textContent = this.scanSnapshot.filters.includeOthers ? "Admin mode includes other people’s messages. This deletes the selected messages for everyone. Telegram cannot undo this." : target.isSaved ? "These messages will be removed from your Saved Messages. Telegram cannot undo this." : "This deletes the messages from your account and, where Telegram permits, for everyone in this chat. Telegram cannot undo this.";
      this.confirmField.hidden = !requireType;
      this.confirmInput.value = "";
      this.modalOpen = true;
      this.modal.hidden = false;
      this.modal.classList.add("wg-show");
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
      const count = this.entries.length;
      const requireType = count > TYPE_CONFIRM_THRESHOLD || this.scanSnapshot?.filters.includeOthers === true;
      this.confirmDelete.disabled = requireType && this.confirmInput.value.trim() !== "DELETE";
    }
    hideConfirm() {
      if (!this.modal) return;
      this.modalOpen = false;
      this.modal.hidden = true;
      this.modal.classList.remove("wg-show");
      this.panel.inert = false;
      this.confirmInput.value = "";
      this.confirmDelete.disabled = false;
      this.modalTarget.textContent = "";
      this.modalFilters.replaceChildren();
      if (!this.busy && this.deleteButton && !this.deleteButton.hidden) {
        try {
          this.deleteButton.focus({ preventScroll: true });
        } catch {
        }
      }
    }
    async confirmDeleteMessages() {
      if (!this.modalOpen || this.busy) return;
      if ((this.entries.length > TYPE_CONFIRM_THRESHOLD || this.scanSnapshot?.filters.includeOthers) && this.confirmInput.value.trim() !== "DELETE") return;
      if (this.targetKey !== this.scanSnapshot?.key) {
        this.hideConfirm();
        this.invalidateResults("The open chat changed. Scan again before deleting.");
        this.showToast("The chat changed. Scan again before deleting.", "warning");
        return;
      }
      this.hideConfirm();
      await this.startDelete();
    }
    async startDelete() {
      if (this.busy || !this.scanSnapshot || !this.entries.length) return;
      const { target, error } = this.currentTargetInfo();
      if (!target || targetKey(target) !== this.scanSnapshot.key) {
        this.invalidateResults(error?.message || "The open chat changed. Scan again before deleting.");
        this.showToast(error?.message || "The chat changed. Scan again before deleting.", "warning");
        return;
      }
      const count = this.entries.length;
      this.resetMetrics();
      this.setMetrics({ checked: this.scanStats?.scanned || 0, found: count, deleted: 0, failed: 0 });
      this.setProgress("determinate", 0);
      this.setStatus(`Deleting 0 of ${formatNumber(count)} messages…`, "info");
      this.addLog("info", `Delete started for ${formatNumber(count)} message${count === 1 ? "" : "s"}.`);
      this.abortController = new AbortController();
      this.setBusy(true, "deleting");
      try {
        const result = await this.engine.delete({
          target: this.scanSnapshot.target,
          entries: this.entries,
          filters: this.scanSnapshot.filters,
          signal: this.abortController.signal
        });
        this.deleteStats = result.stats;
        this.failures = result.failures;
        this.scanSnapshot.deleteStats = result.stats;
        this.scanSnapshot.failures = result.failures;
        const stats = result.stats;
        const processed = stats.processed;
        this.setProgress("determinate", stats.total ? processed / stats.total : 1);
        this.setMetrics({ deleted: stats.deleted, failed: stats.failed });
        this.setBusy(false, "done");
        const extras = [];
        if (stats.alreadyGone) extras.push(`${formatNumber(stats.alreadyGone)} already gone`);
        if (stats.skipped) extras.push(`${formatNumber(stats.skipped)} skipped`);
        if (stats.failed) extras.push(`${formatNumber(stats.failed)} failed`);
        if (stats.error) {
          this.setStatus(`${stats.error.message} ${formatNumber(stats.deleted)} of ${formatNumber(stats.total)} deleted.`, "error");
          this.addLog("error", `${stats.error.message} Deleted ${formatNumber(stats.deleted)} of ${formatNumber(stats.total)}.`);
          this.showToast(stats.error.message, "error");
        } else if (stats.stopped) {
          this.setStatus(`Stopped. ${formatNumber(stats.deleted)} of ${formatNumber(stats.total)} deleted.`, "warning");
          this.addLog("warning", `Delete stopped after ${formatNumber(stats.deleted)} of ${formatNumber(stats.total)} messages.`);
          this.showToast(`Stopped after ${formatNumber(stats.deleted)} of ${formatNumber(stats.total)}.`, "warning");
        } else if (stats.total === 0) {
          this.setStatus("There was nothing to delete.", "warning");
        } else {
          const base = stats.failed ? `Finished with errors. ${formatNumber(stats.deleted)} deleted, ${formatNumber(stats.failed)} failed.` : `Done. ${formatNumber(stats.deleted)} message${stats.deleted === 1 ? "" : "s"} deleted.`;
          const summary = extras.length ? `${base} ${extras.join(", ")}.` : base;
          this.setStatus(summary, stats.failed ? "warning" : "success");
          this.addLog(stats.failed ? "warning" : "success", summary);
          this.showToast(summary, stats.failed ? "warning" : "success");
        }
        if (extras.length) {
          this.addLog("info", `Delete details: ${extras.join(", ")}.`);
        }
        if (stats.floodWaits) {
          this.addLog("info", `Telegram rate limits handled: ${formatNumber(stats.floodWaits)} wait${stats.floodWaits === 1 ? "" : "s"} (${formatDuration(stats.floodSeconds * 1e3)}).`);
        }
      } catch (rawError) {
        const normalized = normalizeError(rawError);
        this.setBusy(false, "done");
        this.setStatus(normalized.message, "error");
        this.addLog("error", normalized.message);
        this.showToast(normalized.message, "error");
      } finally {
        this.entries = [];
        this.renderResults();
        this.abortController = null;
        this.updateButtons();
      }
    }
    abortOperation(reason = "Stopping…") {
      if (!this.abortController) return;
      if (!this.abortController.signal.aborted) {
        this.abortController.abort();
        this.addLog("warning", reason);
        this.setStatus("Stopping…", "warning");
        this.stopButton.disabled = true;
      }
    }
    invalidateResults(message = null, { silent = false } = {}) {
      this.entries = [];
      this.scanSnapshot = null;
      this.scanStats = null;
      this.deleteStats = null;
      this.failures = [];
      this.filters = null;
      this.phase = "idle";
      this.showAllResults = false;
      this.renderResults();
      this.resetMetrics();
      this.setProgress(null);
      this.updateButtons();
      if (message) {
        this.setStatus(message, "warning");
        if (!silent) this.addLog("warning", message);
      }
    }
    resetResults() {
      if (this.busy) return;
      this.invalidateResults(null, { silent: true });
      this.clearFormError();
      this.clearLog();
      this.addLog("info", "Ready. Scan the open chat to preview messages.");
      this.setStatus("Choose filters, then scan the open chat.", "info");
      this.refreshTarget({ quiet: true });
    }
    renderResults() {
      if (!this.results) return;
      const entries = this.entries;
      this.results.hidden = entries.length === 0;
      if (!entries.length) {
        this.resultsList.replaceChildren();
        this.resultsCount.textContent = "";
        this.resultsToggle.hidden = true;
        this.resultsMore.hidden = true;
        return;
      }
      this.resultsCount.textContent = `· ${formatNumber(entries.length)}`;
      this.resultsToggle.hidden = entries.length <= VISIBLE_RESULTS;
      this.resultsToggle.textContent = this.showAllResults ? "Show less" : "Show all";
      const limit = this.showAllResults ? MAX_RENDERED_RESULTS : VISIBLE_RESULTS;
      const shown = entries.slice(0, limit);
      const nodes = shown.map((message) => this.createResultNode(message));
      this.resultsList.replaceChildren(...nodes);
      const truncated = this.showAllResults && entries.length > MAX_RENDERED_RESULTS;
      this.resultsMore.hidden = !truncated;
      if (truncated) {
        this.resultsMore.textContent = `Showing the first ${formatNumber(MAX_RENDERED_RESULTS)} of ${formatNumber(entries.length)} messages. The JSON report contains every ID.`;
      }
    }
    createResultNode(message) {
      const row = document.createElement("div");
      row.className = "wg-result";
      const top = document.createElement("div");
      top.className = "wg-result-top";
      const date = document.createElement("span");
      date.className = "wg-result-date";
      date.textContent = `${formatDate((message.date || 0) * 1e3)} · #${message.id}`;
      const badge = document.createElement("span");
      badge.className = "wg-badge";
      badge.textContent = TYPE_BADGES[mediaKind(message)] || "Message";
      top.append(date, badge);
      const text = document.createElement("div");
      text.className = "wg-result-text wg-blur";
      text.textContent = messagePreview(message) || "[Empty message]";
      row.append(top, text);
      return row;
    }
    buildReport() {
      if (!this.scanSnapshot) return null;
      const snapshot = this.scanSnapshot;
      const target = snapshot.target;
      const filters = snapshot.filters;
      const messages = snapshot.entries.map((message) => ({
        id: message.id,
        date: message.date ? new Date(message.date * 1e3).toISOString() : null,
        type: mediaKind(message),
        preview: messagePreview(message)
      }));
      return {
        app: "Wipegram",
        version: APP_VERSION,
        exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
        page: location.href,
        target: {
          title: target.title,
          kind: target.kind,
          username: target.username || "",
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
        this.addLog("info", "JSON report downloaded.");
        this.showToast("Report downloaded.", "success");
      } catch (rawError) {
        const normalized = normalizeError(rawError);
        this.addLog("error", `Could not download the report: ${normalized.message}`);
        this.showToast("Could not download the report.", "error");
      }
    }
    handleEngineEvent(event) {
      switch (event.type) {
        case "scan:start":
          this.setStatus(event.filters.includeOthers ? "Scanning everyone’s messages — admin mode…" : "Scanning for your messages…", "info");
          this.setProgress("indeterminate");
          break;
        case "scan:progress": {
          this.setMetrics({ checked: event.scanned, found: event.matched });
          const checked = formatNumber(event.scanned);
          const found = formatNumber(event.matched);
          this.setStatus(
            event.mode === "search" ? `Searching… ${found} of your messages found.` : `Scanning history… ${checked} ${this.includeOthers ? "messages" : "of your messages"} checked, ${found} found.`,
            "info"
          );
          break;
        }
        case "scan:fallback":
          this.addLog("warning", `${event.reason} Continuing with a full history scan.`);
          this.setStatus("Switching to full history…", "warning");
          this.showToast("Switching to a full history scan.", "warning");
          break;
        case "scan:verify":
          this.addLog("info", event.reason);
          this.setStatus("Checking recent messages missing from search…", "info");
          break;
        case "scan:warning":
          this.addLog("warning", `${event.message}${event.error ? ` (${event.error})` : ""}`);
          break;
        case "scan:done":
          break;
        case "delete:start":
          this.setStatus(`Deleting 0 of ${formatNumber(event.total)} messages…`, "info");
          this.setProgress("determinate", 0);
          break;
        case "delete:progress": {
          this.setMetrics({ deleted: event.deleted, failed: event.failed });
          const fraction = event.total ? event.processed / event.total : 0;
          this.setProgress("determinate", fraction);
          this.setStatus(`Deleting ${formatNumber(event.processed)} of ${formatNumber(event.total)} messages…`, "info");
          break;
        }
        case "delete:warning":
          this.addLog("warning", `${event.message}${event.error ? ` (${event.error})` : ""}`);
          break;
        case "delete:error":
          this.addLog("error", event.message);
          break;
        case "delete:done":
          break;
        case "flood":
          this.addLog("warning", `Telegram rate limit: waiting ${formatDuration(event.seconds * 1e3)}.`);
          this.setStatus(`Telegram rate limit — waiting ${formatDuration(event.seconds * 1e3)}…`, "warning");
          this.showToast(`Rate limited. Waiting ${formatDuration(event.seconds * 1e3)}…`, "warning");
          break;
        case "retry":
          this.addLog("warning", `${event.message} Retrying in ${formatDuration(event.delay)} (attempt ${event.attempt}).`);
          this.setStatus(`Network hiccup — retrying in ${formatDuration(event.delay)}…`, "warning");
          break;
        default:
          break;
      }
    }
    onPanelKeydown(event) {
      event.stopPropagation();
      if (event.key === "Escape") {
        event.preventDefault();
        if (this.modalOpen) this.hideConfirm();
        else this.close();
        return;
      }
      if (event.key === "Tab" && this.modalOpen) {
        const focusable = [...this.modal.querySelectorAll("button, input")].filter((element) => !element.disabled && !element.hidden && element.getClientRects().length > 0);
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
      const handle = this.shadow.getElementById("drag-handle");
      handle.addEventListener("pointerdown", (event) => {
        if (event.button !== 0 || event.target.closest("button")) return;
        if (window.matchMedia("(max-width: 680px)").matches) return;
        const rect = this.panel.getBoundingClientRect();
        this.drag = {
          startX: event.clientX,
          startY: event.clientY,
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        };
        this.panel.classList.add("wg-dragging");
        handle.setPointerCapture?.(event.pointerId);
        event.preventDefault();
      });
      handle.addEventListener("pointermove", (event) => {
        if (!this.drag) return;
        const nextLeft = this.drag.left + (event.clientX - this.drag.startX);
        const nextTop = this.drag.top + (event.clientY - this.drag.startY);
        this.positionPanel(nextLeft, nextTop);
      });
      const end = () => {
        if (!this.drag) return;
        this.drag = null;
        this.panel.classList.remove("wg-dragging");
      };
      handle.addEventListener("pointerup", end);
      handle.addEventListener("pointercancel", end);
    }
    positionPanel(left, top) {
      const rect = this.panel.getBoundingClientRect();
      const margin = 8;
      const maxLeft = Math.max(margin, window.innerWidth - rect.width - margin);
      const maxTop = Math.max(margin, window.innerHeight - rect.height - margin);
      this.panel.style.left = `${Math.min(maxLeft, Math.max(margin, left))}px`;
      this.panel.style.top = `${Math.min(maxTop, Math.max(margin, top))}px`;
      this.panel.style.right = "auto";
    }
    clampPanel() {
      if (!this.panel || this.panel.style.right !== "auto" || !this.panel.style.left) return;
      const rect = this.panel.getBoundingClientRect();
      this.positionPanel(rect.left, rect.top);
    }
    destroy() {
      this.destroyed = true;
      this.stopPolling();
      this.abortController?.abort();
      this.themeObserver?.disconnect();
      if (this.toastTimer) clearTimeout(this.toastTimer);
      document.removeEventListener("keydown", this.onDocumentKeydown);
      document.removeEventListener("pointerdown", this.onDocumentPointerDown);
      for (const type of ["keydown", "keypress", "keyup"]) {
        window.removeEventListener(type, this.onWindowKeyEvent, true);
      }
      window.removeEventListener("focusin", this.onWindowFocusIn, true);
      window.removeEventListener("resize", this.onResize);
      this.host?.remove();
      this.host = null;
      this.shadow = null;
    }
  };

  // dom-template:src/notice.html
  var notice_default = [["div", "http://www.w3.org/1999/xhtml", [["class", "card", null], ["role", "alert", null]], ["\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "logo", null], ["aria-hidden", "true", null]], ["W"]], "\n      ", ["div", "http://www.w3.org/1999/xhtml", [["class", "content", null]], ["\n        ", ["div", "http://www.w3.org/1999/xhtml", [["class", "title", null]], ["Telegram Web A is not supported"]], "\n        ", ["p", "http://www.w3.org/1999/xhtml", [["class", "text", null]], ["Wipegram needs Telegram Web K because it exposes the API bridge used to delete messages locally. Your messages are not touched on this page."]], "\n        ", ["div", "http://www.w3.org/1999/xhtml", [["class", "actions", null]], ["\n          ", ["a", "http://www.w3.org/1999/xhtml", [["class", "button", null], ["href", "https://web.telegram.org/k/", null], ["target", "_self", null]], ["Open Telegram Web K"]], "\n          ", ["button", "http://www.w3.org/1999/xhtml", [["type", "button", null], ["class", "dismiss", null]], ["Dismiss"]], "\n        "]], "\n      "]], "\n      ", ["button", "http://www.w3.org/1999/xhtml", [["type", "button", null], ["class", "close", null], ["aria-label", "Dismiss", null]], ["×"]], "\n    "]], "\n"];

  // src/unsupported.js
  var DISMISS_KEY = "wipegram.unsupported.dismissed";
  var HOST_ID = "wipegram-unsupported";
  var STYLES = `
  :host {
    all: initial;
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 2147483000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color-scheme: light;
  }

  * { box-sizing: border-box; }

  .card {
    display: flex;
    gap: 12px;
    width: min(370px, calc(100vw - 32px));
    padding: 15px;
    border: 1px solid rgba(16, 24, 40, 0.1);
    border-radius: 14px;
    background: #ffffff;
    color: #16181c;
    box-shadow: 0 18px 60px rgba(15, 23, 42, 0.24), 0 2px 10px rgba(15, 23, 42, 0.08);
    animation: in 0.18s ease-out;
  }

  .logo {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    flex: 0 0 auto;
    border-radius: 12px;
    background: linear-gradient(135deg, #3390ec, #7b5cf0);
    color: #ffffff;
    font-size: 19px;
    font-weight: 800;
  }

  .content { min-width: 0; flex: 1; }

  .title {
    margin: 1px 0 4px;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.3;
  }

  .text {
    margin: 0;
    color: #707579;
    font-size: 12px;
    line-height: 1.5;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    padding: 0 11px;
    border: 0;
    border-radius: 8px;
    background: #3390ec;
    color: #ffffff;
    font: inherit;
    font-size: 12px;
    font-weight: 650;
    text-decoration: none;
    cursor: pointer;
  }

  .button:hover { background: #2b7fce; }

  .dismiss {
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #8a8f94;
    font: inherit;
    font-size: 11.5px;
    cursor: pointer;
    padding: 3px 5px;
  }

  .dismiss:hover { background: rgba(16, 24, 40, 0.06); color: #16181c; }

  .close {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 26px;
    height: 26px;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: #8a8f94;
    font: inherit;
    font-size: 17px;
    line-height: 1;
    cursor: pointer;
  }

  .close:hover { background: rgba(16, 24, 40, 0.06); color: #16181c; }

  @media (prefers-color-scheme: dark) {
    .card { border-color: rgba(255, 255, 255, 0.1); background: #212121; color: #f2f2f2; }
    .text { color: #a2a2a2; }
    .dismiss { color: #8b8b8b; }
    .dismiss:hover, .close:hover { background: rgba(255, 255, 255, 0.08); color: #f2f2f2; }
  }

  html.night .card, :host(.night) .card {
    border-color: rgba(255, 255, 255, 0.1);
    background: #212121;
    color: #f2f2f2;
  }

  @keyframes in {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .card { animation: none; }
  }
`;
  function showUnsupportedNotice() {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
    }
    if (document.getElementById(HOST_ID)) return;
    const host = document.createElement("div");
    host.id = HOST_ID;
    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLES;
    shadow.append(style, createNodes(notice_default));
    const dismiss = () => {
      try {
        sessionStorage.setItem(DISMISS_KEY, "1");
      } catch {
      }
      host.remove();
    };
    shadow.querySelector(".dismiss").addEventListener("click", dismiss);
    shadow.querySelector(".close").addEventListener("click", dismiss);
    (document.body || document.documentElement).appendChild(host);
    const isNight = () => document.documentElement.classList.contains("night") || document.body?.classList.contains("night");
    const update = () => host.classList.toggle("night", isNight());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    if (document.body) {
      observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    }
  }

  // src/index.js
  var VERSION = false ? "dev" : "0.3.1";
  function isWebK() {
    return /^\/k(?:\/|$)/.test(location.pathname);
  }
  function isWebA() {
    return /^\/a(?:\/|$)/.test(location.pathname);
  }
  async function boot() {
    if (window.__wipegram?.ui) return;
    try {
      await waitForTelegram(6e4);
    } catch (error) {
      console.warn("[Wipegram] Telegram Web K did not finish loading.", error);
      return;
    }
    if (window.__wipegram?.ui) return;
    const api = new TelegramApi();
    const engine = new WipegramEngine({ api });
    const ui = new WipegramUI({ api, engine });
    const launcher = createWipegramLauncher({ onOpen: () => ui.toggle() });
    ui.setLauncher(launcher.button, launcher.fab);
    ui.mount();
    const beforeUnload = () => {
      ui.destroy();
      launcher.destroy();
    };
    window.addEventListener("beforeunload", beforeUnload, { once: true });
    window.addEventListener("pagehide", beforeUnload, { once: true });
    window.__wipegram = {
      version: VERSION,
      api,
      engine,
      ui,
      launcher,
      destroy() {
        window.removeEventListener("beforeunload", beforeUnload);
        window.removeEventListener("pagehide", beforeUnload);
        ui.destroy();
        launcher.destroy();
        delete window.__wipegram;
      }
    };
    console.info(`[Wipegram] v${VERSION} ready. Press Alt+Shift+W or use the W button in the chat topbar.`);
  }
  if (isWebA()) {
    showUnsupportedNotice();
  } else if (isWebK()) {
    boot();
  }
})();
