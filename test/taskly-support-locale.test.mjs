import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const widgetSource = fs.readFileSync(new URL('../support-widget/taskly-support.js', import.meta.url), 'utf8');
const { getLocalizedStrings, normalizeLocale } = await import(
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
