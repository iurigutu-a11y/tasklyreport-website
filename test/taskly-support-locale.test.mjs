import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const widgetSource = fs.readFileSync(new URL('../support-widget/taskly-support.js', import.meta.url), 'utf8');
const loaderSource = fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const { getLocalizedStrings, normalizeLocale, readSupportConfig } = await import(
  `data:text/javascript,${encodeURIComponent(widgetSource)}`,
);

test('normalizes locale language tags', () => {
  assert.equal(normalizeLocale('it-IT'), 'it-IT');
  assert.equal(normalizeLocale('ru_RU'), 'ru-RU');
});

test('provides Italian widget strings', () => {
  assert.deepEqual(getLocalizedStrings('it'), {
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
  });
});

test('provides Russian widget strings', () => {
  assert.equal(getLocalizedStrings('ru').title, 'Поддержка Taskly');
  assert.equal(getLocalizedStrings('ru').welcome, 'Здравствуйте. Спросите меня о продуктах и функциях Taskly.');
  assert.equal(getLocalizedStrings('ru').placeholder, 'Задайте вопрос...');
  assert.equal(getLocalizedStrings('ru').send, 'Отправить');
  assert.match(getLocalizedStrings('ru').rateLimited, /много запросов/);
});

test('falls back to English for unsupported locales', () => {
  assert.equal(getLocalizedStrings('de').title, 'Taskly Support');
  assert.equal(getLocalizedStrings('de').send, 'Send message');
});

function loaderDocument(locale) {
  const loader = {
    id: 'taskly-support-loader',
    dataset: {
      locale,
      apiBase: 'https://taskly-ai-server-7ztrsl34mq-ew.a.run.app',
      product: 'taskly_report_pro',
    },
  };

  return {
    querySelector(selector) {
      if (selector === '#taskly-support-loader') return loader;
      return null;
    },
  };
}

test('reads Russian locale and support configuration from the exact loader element', () => {
  const config = readSupportConfig(loaderDocument('ru'));
  assert.equal(config.locale, 'ru');
  assert.equal(getLocalizedStrings(config.locale).title, 'Поддержка Taskly');
  assert.equal(getLocalizedStrings(config.locale).welcome, 'Здравствуйте. Спросите меня о продуктах и функциях Taskly.');
  assert.equal(getLocalizedStrings(config.locale).placeholder, 'Задайте вопрос...');
  assert.equal(getLocalizedStrings(config.locale).send, 'Отправить');
  assert.equal(config.apiBase, 'https://taskly-ai-server-7ztrsl34mq-ew.a.run.app');
  assert.equal(config.product, 'taskly_report_pro');
});

test('reads Italian and English locale from the exact loader element', () => {
  assert.equal(getLocalizedStrings(readSupportConfig(loaderDocument('it')).locale).title, 'Supporto Taskly');
  assert.equal(getLocalizedStrings(readSupportConfig(loaderDocument('it')).locale).send, 'Invia');
  assert.equal(getLocalizedStrings(readSupportConfig(loaderDocument('en')).locale).title, 'Taskly Support');
  assert.equal(getLocalizedStrings(readSupportConfig(loaderDocument('en')).locale).send, 'Send message');
});

test('falls back to English through the loader config for unsupported locales', () => {
  const config = readSupportConfig(loaderDocument('de'));
  assert.equal(getLocalizedStrings(config.locale).title, 'Taskly Support');
  assert.equal(getLocalizedStrings(config.locale).send, 'Send message');
});

test('website loader uses one stable support script and avoids duplicate initialization', () => {
  assert.match(loaderSource, /script\.id = "taskly-support-loader"/);
  assert.match(loaderSource, /document\.querySelector\("script\[data-taskly-support-loader\]"\)/);
});
