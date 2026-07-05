import { useEffect, useState } from 'react';
import { routes } from '../../app/routes';
import { getVocabularyFile } from '../../db/vocabularyRepository';
import type { VocabularyFileWithEntries } from './types';

type FileSavedPageProps = {
  fileId: string;
};

export function FileSavedPage({ fileId }: FileSavedPageProps) {
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

      <section className="content-card" aria-labelledby="saved-file-heading">
        {isLoading ? (
          <p className="empty-state">Loading file...</p>
        ) : fileData ? (
          <>
            <h1 id="saved-file-heading" className="page-title">
              {fileData.file.title}
            </h1>
            <p className="form-hint">
              Saved {fileData.entries.length}{' '}
              {fileData.entries.length === 1 ? 'entry' : 'entries'}.
            </p>
            <ol className="preview-list">
              {fileData.entries.map((entry) => (
                <li key={entry.id}>
                  <span>{entry.dutch}</span>
                  <strong>{entry.chinese}</strong>
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
