import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';

const root = new URL('..', import.meta.url).pathname;

test('homepage and FAQ describe the released AI work-description workflow', async () => {
  const [homepage, faq] = await Promise.all([
    readFile(join(root, 'index.html'), 'utf8'),
    readFile(join(root, 'faq.html'), 'utf8'),
  ]);

  assert.match(homepage, /editable work-description draft/);
  assert.match(homepage, /saved project description, work steps, estimate-item descriptions, and selected photos/);
  assert.match(homepage, /replace or append the editable draft/);
  assert.match(homepage, /include the saved Description in a project PDF/);
  assert.match(faq, /AI · Generate work description/);
  assert.match(faq, /up to three photos you explicitly select/);
  assert.match(faq, /PDF generation is a separate action/);
  assert.doesNotMatch(faq, /learns from your work patterns/i);
  assert.doesNotMatch(faq, /automatically creates comprehensive reports/i);
});

test('AI-card translations use the verified inputs in priority locales', async () => {
  const translations = await readFile(join(root, 'translations.js'), 'utf8');

  for (const expected of [
    'Turn saved project details and selected photos into an editable work-description draft.',
    'Trasforma i dettagli salvati del progetto e le foto selezionate in una bozza modificabile della descrizione del lavoro.',
    'Превращайте сохранённое описание проекта, этапы работ, позиции сметы и выбранные фото в редактируемый черновик описания работ.',
    'Verwandeln Sie gespeicherte Projektdetails und ausgewählte Fotos in einen bearbeitbaren Entwurf der Arbeitsbeschreibung.',
    'Transformați detaliile salvate ale proiectului și fotografiile selectate într-o schiță editabilă a descrierii lucrării.',
  ]) {
    assert.ok(translations.includes(expected), `missing verified translation: ${expected}`);
  }

  assert.doesNotMatch(translations, /Works with project data and notes/);
  assert.doesNotMatch(translations, /Lavorare con i dati del progetto e le note/);
  assert.doesNotMatch(translations, /Работать с данными проекта и заметками/);
  assert.doesNotMatch(translations, /Mit Projektdaten und Notizen zu arbeiten/);
  assert.doesNotMatch(translations, /Lucrați cu datele proiectului și notițele/);
});
