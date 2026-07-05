import { useEffect, useState } from 'react';
import { routes } from '../../app/routes';
import { getVocabularyFile } from '../../db/vocabularyRepository';
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

export function FileViewPage({ fileId }: FileViewPageProps) {
  const [fileData, setFileData] = useState<VocabularyFileWithEntries | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadFile() {
      const savedFile = await getVocabularyFile(fileId);

      if (isMounted) {
        setFileData(savedFile);
        setIsLoading(false);
      }
    }

    void loadFile();

    return () => {
      isMounted = false;
    };
  }, [fileId]);

  return (
    <main className="app-shell">
      <header className="page-header">
        <a className="back-link" href={routes.home}>
          wooord
        </a>
        <p className="eyebrow">File</p>
      </header>

      <section className="content-card" aria-labelledby="file-heading">
        {isLoading ? (
          <p className="empty-state">Loading file...</p>
        ) : fileData ? (
          <>
            <div className="top-action-row">
              <h1 id="file-heading" className="page-title">
                {fileData.file.title}
              </h1>
              <button
                className="icon-button icon-button-secondary"
                type="button"
                aria-label="Edit file"
                disabled
              >
                <EditIcon />
              </button>
            </div>

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
          </>
        ) : (
          <p className="empty-state">This file was not found.</p>
        )}
      </section>
    </main>
  );
}
