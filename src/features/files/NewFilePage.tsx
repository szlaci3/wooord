import { type FormEvent, useId, useState } from 'react';
import { routes } from '../../app/routes';
import { createVocabularyFile } from '../../db/vocabularyRepository';
import { parseVocabulary } from './parseVocabulary';

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createFileTitle(firstDutchExpression: string) {
  const firstDutchWord = firstDutchExpression.trim().split(/\s+/u)[0];

  return `${firstDutchWord} — ${formatLocalDate(new Date())}`;
}

function SaveIcon() {
  return (
    <svg
      className="button-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 3h12l2 2v16H5V3Zm2 2v14h10V6.2L15.8 5H15v5H8V5H7Zm3 0v3h3V5h-3Zm-1 9h6v2H9v-2Z" />
    </svg>
  );
}

export function NewFilePage() {
  const textareaId = useId();
  const [rawText, setRawText] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    const parsed = parseVocabulary(rawText);

    if (parsed.entries.length === 0) {
      setMessage('Paste at least one valid Dutch-Chinese vocabulary line.');
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const savedFile = await createVocabularyFile({
        title: createFileTitle(parsed.entries[0].dutch),
        entries: parsed.entries,
      });

      window.location.assign(routes.file(savedFile.file.id));
    } catch {
      setMessage('The file could not be saved. Try again.');
      setIsSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <a className="back-link" href={routes.home}>
          wooord
        </a>
        <p className="eyebrow">New file</p>
      </header>

      <form
        className="content-card file-form"
        aria-labelledby="new-file-heading"
        onSubmit={handleSubmit}
      >
        <div className="top-action-row">
          <div>
            <h1 id="new-file-heading" className="page-title">
              Paste vocabulary
            </h1>
          </div>
          <button
            className="icon-button"
            type="submit"
            aria-label="Save vocabulary file"
            disabled={isSaving}
          >
            <SaveIcon />
          </button>
        </div>

        <label className="field-label" htmlFor={textareaId}>
          Vocabulary text
        </label>
        <textarea
          id={textareaId}
          className="vocabulary-textarea"
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          placeholder={'natuurlijk  当然\nbestel订购\nzalig舒服的'}
          rows={12}
        />

        {message ? <p className="form-message">{message}</p> : null}
      </form>
    </main>
  );
}
