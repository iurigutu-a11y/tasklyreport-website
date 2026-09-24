const DEFAULT_STRINGS = Object.freeze({
  title: 'Taskly Support',
  welcome: 'Hi. Ask me about Taskly products and features.',
  placeholder: 'Ask a question...',
  send: 'Send message',
  close: 'Close support chat',
  open: 'Open Taskly Support',
  thinking: 'Thinking…',
  rateLimited: 'Support is receiving many requests right now. Please try again shortly.',
  unavailable: 'AI support is temporarily unavailable.',
  unavailableLater: 'AI support is temporarily unavailable. Please try again later.',
  connection: 'Connection problem. Please try again.',
  malformed: 'I could not read the support response. Please try again.',
});

const LOCALE_STRINGS = Object.freeze({
  it: Object.freeze({
    title: 'Supporto Taskly',
    welcome: 'Ciao. Chiedimi informazioni sui prodotti e sulle funzioni di Taskly.',
    placeholder: 'Fai una domanda...',
    send: 'Invia',
    close: 'Chiudi il supporto',
    open: 'Apri il supporto Taskly',
    thinking: 'Sto pensando…',
    rateLimited: 'Il supporto sta ricevendo molte richieste. Riprova tra poco.',
    unavailable: 'Il supporto AI non è temporaneamente disponibile.',
    unavailableLater: 'Il supporto AI non è temporaneamente disponibile. Riprova più tardi.',
    connection: 'Problema di connessione. Riprova.',
    malformed: 'Non ho potuto leggere la risposta del supporto. Riprova.',
  }),
  ru: Object.freeze({
    title: 'Поддержка Taskly',
    welcome: 'Здравствуйте. Спросите меня о продуктах и функциях Taskly.',
    placeholder: 'Задайте вопрос...',
    send: 'Отправить',
    close: 'Закрыть поддержку',
    open: 'Открыть поддержку Taskly',
    thinking: 'Думаю…',
    rateLimited: 'Сейчас поддержка получает много запросов. Повторите попытку позже.',
    unavailable: 'ИИ-поддержка временно недоступна.',
    unavailableLater: 'ИИ-поддержка временно недоступна. Повторите попытку позже.',
    connection: 'Проблема с подключением. Повторите попытку.',
    malformed: 'Не удалось прочитать ответ поддержки. Повторите попытку.',
  }),
});

const MAX_RENDERED_MESSAGES = 20;
const MESSAGE_MAX_LENGTH = 4_000;

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeLocale(value) {
  const candidate = cleanString(value || globalThis.navigator?.language || '');
  if (!candidate) return 'en';
  const parts = candidate.replaceAll('_', '-').split('-');
  const language = parts[0]?.toLowerCase();
  if (!language || !/^[a-z]{2,3}$/.test(language)) return 'en';
  const normalized = [language];
  for (const part of parts.slice(1)) {
    if (/^[a-z]{4}$/i.test(part))
      normalized.push(part[0].toUpperCase() + part.slice(1).toLowerCase());
    else if (/^(?:[a-z]{2}|\d{3})$/i.test(part)) normalized.push(part.toUpperCase());
  }
  return normalized.join('-').slice(0, 35);
}

export function getLocalizedStrings(locale) {
  const language = normalizeLocale(locale).split('-', 1)[0];
  return { ...DEFAULT_STRINGS, ...(LOCALE_STRINGS[language] || {}) };
}

export function createSessionId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  return `taskly-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function buildChatPayload({ message, locale, sessionId, product }) {
  const payload = {
    message: cleanString(message).slice(0, MESSAGE_MAX_LENGTH),
    locale: normalizeLocale(locale),
    sessionId: cleanString(sessionId),
  };
  const normalizedProduct = cleanString(product);
  if (normalizedProduct) payload.product = normalizedProduct;
  return payload;
}

export function parseSupportResponse(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new Error('Malformed support response.');
  const answer = cleanString(value.answer);
  if (!answer || answer.length > 5_000) throw new Error('Malformed support response.');
  return { answer };
}

export function friendlyErrorMessage(status, code, strings = DEFAULT_STRINGS) {
  if (status === 429) return strings.rateLimited;
  if (status === 503 && code === 'SUPPORT_CHAT_PROVIDER_BUDGET_EXHAUSTED')
    return strings.unavailableLater;
  if (status === 503) return strings.unavailable;
  if (status === 0) return strings.connection;
  return strings.connection;
}

function errorCode(value) {
  return typeof value === 'object' && value !== null && typeof value.error?.code === 'string'
    ? value.error.code
    : undefined;
}

function makeElement(documentRef, tagName, className, text) {
  const element = documentRef.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function appendMessage(documentRef, messageList, role, text) {
  const item = makeElement(
    documentRef,
    'div',
    `taskly-support-message taskly-support-message--${role}`,
  );
  item.setAttribute('role', 'listitem');
  const bubble = makeElement(documentRef, 'p', 'taskly-support-message__bubble');
  bubble.textContent = text;
  item.append(bubble);
  messageList.append(item);
  while (messageList.children.length > MAX_RENDERED_MESSAGES)
    messageList.firstElementChild?.remove();
  messageList.scrollTop = messageList.scrollHeight;
}

function stylesheetFor(documentRef, scriptElement) {
  const cssHref =
    scriptElement?.dataset?.css || scriptElement?.src?.replace(/\.js(?:[?#].*)?$/, '.css');
  if (!cssHref || documentRef.querySelector(`link[href="${cssHref}"]`)) return;
  const link = documentRef.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssHref;
  documentRef.head.append(link);
}

export function createSupportWidget(options = {}) {
  const documentRef = options.document || globalThis.document;
  const strings = { ...getLocalizedStrings(options.locale), ...(options.strings || {}) };
  const root = makeElement(documentRef, 'div', 'taskly-support-widget');
  const toggle = makeElement(documentRef, 'button', 'taskly-support-widget__toggle', '✦');
  toggle.type = 'button';
  toggle.setAttribute('aria-label', strings.open);
  toggle.setAttribute('aria-expanded', 'false');
  const panel = makeElement(documentRef, 'section', 'taskly-support-widget__panel');
  const panelId = `taskly-support-panel-${Math.random().toString(36).slice(2)}`;
  panel.id = panelId;
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-labelledby', `${panelId}-title`);

  const header = makeElement(documentRef, 'header', 'taskly-support-widget__header');
  const title = makeElement(documentRef, 'h2', 'taskly-support-widget__title', strings.title);
  title.id = `${panelId}-title`;
  const close = makeElement(documentRef, 'button', 'taskly-support-widget__close', '×');
  close.type = 'button';
  close.setAttribute('aria-label', strings.close);
  header.append(title, close);

  const messages = makeElement(documentRef, 'div', 'taskly-support-widget__messages');
  messages.setAttribute('role', 'list');
  messages.setAttribute('aria-live', 'polite');
  appendMessage(documentRef, messages, 'assistant', strings.welcome);

  const status = makeElement(documentRef, 'p', 'taskly-support-widget__status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  const form = makeElement(documentRef, 'form', 'taskly-support-widget__form');
  const label = makeElement(
    documentRef,
    'label',
    'taskly-support-widget__label',
    strings.placeholder,
  );
  const input = makeElement(documentRef, 'textarea', 'taskly-support-widget__input');
  input.id = `${panelId}-input`;
  input.name = 'message';
  input.rows = 2;
  input.maxLength = MESSAGE_MAX_LENGTH;
  input.placeholder = strings.placeholder;
  input.setAttribute('aria-label', strings.placeholder);
  label.htmlFor = input.id;
  const send = makeElement(documentRef, 'button', 'taskly-support-widget__send', strings.send);
  send.type = 'submit';
  form.append(label, input, send);
  panel.append(header, messages, status, form);
  root.append(toggle, panel);
  documentRef.body.append(root);

  let open = false;
  let sending = false;
  const sessionId = options.sessionId || createSessionId();
  const endpoint =
    options.endpoint ||
    `${cleanString(options.apiBase)}/support/chat`.replace(/^\/support\/chat$/, '/support/chat');
  const fetcher = options.fetch || globalThis.fetch.bind(globalThis);

  const setOpen = (nextOpen) => {
    open = nextOpen;
    panel.hidden = !open;
    panel.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    if (open) input.focus();
    else toggle.focus();
  };
  const setSending = (nextSending) => {
    sending = nextSending;
    input.disabled = sending;
    send.disabled = sending;
    status.textContent = sending ? strings.thinking : '';
  };

  toggle.addEventListener('click', () => setOpen(!open));
  close.addEventListener('click', () => setOpen(false));
  close.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault();
      setOpen(false);
    }
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
    if (event.key === 'Escape' && open) setOpen(false);
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    const message = cleanString(input.value);
    if (!message) return;
    appendMessage(documentRef, messages, 'user', message);
    input.value = '';
    setSending(true);
    try {
      const response = await fetcher(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(
          buildChatPayload({
            message,
            locale: options.locale,
            sessionId,
            product: options.product,
          }),
        ),
      });
      let body;
      try {
        body = await response.json();
      } catch {
        throw new Error(friendlyErrorMessage(response.status, undefined, strings));
      }
      if (!response.ok)
        throw new Error(friendlyErrorMessage(response.status, errorCode(body), strings));
      appendMessage(documentRef, messages, 'assistant', parseSupportResponse(body).answer);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : '';
      const knownResponseError = [
        strings.rateLimited,
        strings.unavailable,
        strings.unavailableLater,
      ].includes(errorText);
      const messageText =
        errorText === 'Malformed support response.'
          ? strings.malformed
          : knownResponseError
            ? errorText
            : strings.connection;
      appendMessage(documentRef, messages, 'assistant', messageText);
    } finally {
      setSending(false);
      input.focus();
    }
  });

  return { root, open: () => setOpen(true), close: () => setOpen(false) };
}

export function getSupportScriptElement(documentRef = globalThis.document) {
  if (!documentRef) return null;
  return (
    documentRef.querySelector('#taskly-support-loader') ||
    documentRef.querySelector('script[data-taskly-support-loader="true"]')
  );
}

export function readSupportConfig(documentRef = globalThis.document) {
  const scriptElement = getSupportScriptElement(documentRef);
  return {
    apiBase: scriptElement?.dataset?.apiBase || '',
    endpoint: scriptElement?.dataset?.endpoint,
    locale: scriptElement?.dataset?.locale,
    product: scriptElement?.dataset?.product,
  };
}

function autoInitialize() {
  const documentRef = globalThis.document;
  if (!documentRef) return;
  const scriptElement = getSupportScriptElement(documentRef);
  const config = readSupportConfig(documentRef);
  stylesheetFor(documentRef, scriptElement);
  if (!documentRef.querySelector('.taskly-support-widget')) {
    createSupportWidget({
      document: documentRef,
      ...config,
    });
  }
}

if (globalThis.document) {
  if (globalThis.document.readyState === 'loading')
    globalThis.document.addEventListener('DOMContentLoaded', autoInitialize);
  else autoInitialize();
}
