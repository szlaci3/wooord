import { useEffect, useState } from 'react';
import { routes } from '../../app/routes';
import {
  getVocabularyFile,
  updateVocabularyFile,
} from '../../db/vocabularyRepository';
import { parseVocabulary } from './parseVocabulary';
import { speakChinese } from './speech';
import type { VocabularyFileWithEntries } from './types';

type FileViewPageProps = {
  fileId: string;
};

function EditIcon() {
  return (
    <svg
      className="button-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m5 16.9-.8 3.9 3.9-.8L18.8 9.3l-3.1-3.1L5 16.9Zm12.1-12.3 3.1 3.1 1-1a1.5 1.5 0 0 0 0-2.1l-1.8-1.8a1.5 1.5 0 0 0-2.1 0l-1 1Z" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg
      className="button-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 9v6h4l5 4V5L8 9H4Zm12.6-.7-1.4 1.4A3.2 3.2 0 0 1 16 12c0 .9-.3 1.7-.8 2.3l1.4 1.4A5.1 5.1 0 0 0 18 12c0-1.4-.5-2.7-1.4-3.7Zm2.8-2.8L18 6.9a7.2 7.2 0 0 1 2 5.1c0 2-.8 3.8-2 5.1l1.4 1.4A9.1 9.1 0 0 0 22 12c0-2.5-1-4.8-2.6-6.5Z" />
    </svg>
  );
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

function entriesToRawText(fileData: VocabularyFileWithEntries) {
  return fileData.entries
    .map((entry) => `${entry.dutch}  ${entry.chinese}`)
    .join('\n');
}

export function FileViewPage({ fileId }: FileViewPageProps) {
  const [fileData, setFileData] = useState<VocabularyFileWithEntries | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [rawDraft, setRawDraft] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadFile() {
      const savedFile = await getVocabularyFile(fileId);

      if (isMounted) {
        setFileData(savedFile);
        setIsLoading(false);
        setIsEditing(false);
        setMessage('');
      }
    }

    void loadFile();

    return () => {
      isMounted = false;
    };
  }, [fileId]);

  function enterEditMode() {
    if (!fileData) {
      return;
    }

    setTitleDraft(fileData.file.title);
    setRawDraft(entriesToRawText(fileData));
    setMessage('');
    setIsEditing(true);
  }

  async function saveEdit() {
    if (!fileData || isSaving) {
      return;
    }

    const parsed = parseVocabulary(rawDraft);

    if (!titleDraft.trim()) {
      setMessage('Add a file title before saving.');
      return;
    }

    if (parsed.entries.length === 0) {
      setMessage('Keep at least one valid Dutch-Chinese vocabulary line.');
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const updatedFile = await updateVocabularyFile(fileData.file.id, {
        title: titleDraft.trim(),
        entries: parsed.entries,
      });

      if (!updatedFile) {
        setMessage('This file was not found.');
        return;
      }

      setFileData(updatedFile);
      setIsEditing(false);
    } catch {
      setMessage('The file could not be saved. Try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <a className="back-link" href={routes.home}>
          wooord
        </a>
        <p className="eyebrow">File</p>
      </header>

      <section className="content-card" aria-label="File">
        {isLoading ? (
          <p className="empty-state">Loading file...</p>
        ) : fileData ? (
          <>
            <div className="top-action-row">
              {isEditing ? (
                <div className="edit-title-field">
                  <label className="field-label" htmlFor="file-title">
                    File title
                  </label>
                  <input
                    id="file-title"
                    className="title-input"
                    value={titleDraft}
                    onChange={(event) => setTitleDraft(event.target.value)}
                  />
                </div>
              ) : (
                <h1 id="file-heading" className="page-title">
                  {fileData.file.title}
                </h1>
              )}
              <button
                className="icon-button icon-button-secondary"
                type="button"
                aria-label={isEditing ? 'Save file' : 'Edit file'}
                disabled={isSaving}
                onClick={isEditing ? saveEdit : enterEditMode}
              >
                {isEditing ? <SaveIcon /> : <EditIcon />}
              </button>
            </div>

            {message ? <p className="form-message">{message}</p> : null}

            {isEditing ? (
              <div className="edit-content-field">
                <label className="field-label" htmlFor="file-content">
                  Vocabulary text
                </label>
                <textarea
                  id="file-content"
                  className="vocabulary-textarea"
                  value={rawDraft}
                  onChange={(event) => setRawDraft(event.target.value)}
                  rows={12}
                />
              </div>
            ) : (
              <ol className="entry-list">
                {fileData.entries.map((entry) => (
                  <li key={entry.id} className="entry-item">
                    <span className="entry-dutch">{entry.dutch}</span>
                    <div className="entry-chinese-row">
                      <button
                        className="entry-chinese-button"
                        type="button"
                        onClick={() => speakChinese(entry.chinese)}
                      >
                        {entry.chinese}
                      </button>
                      <button
                        className="entry-audio-button"
                        type="button"
                        aria-label={`Play Chinese translation: ${entry.chinese}`}
                        onClick={() => speakChinese(entry.chinese)}
                      >
                        <SpeakerIcon />
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </>
        ) : (
          <p className="empty-state">This file was not found.</p>
        )}
      </section>
    </main>
  );
}
