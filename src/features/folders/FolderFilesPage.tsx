import { useEffect, useState } from 'react';
import { routes } from '../../app/routes';
import {
  getFolder,
  listVocabularyFilesByFolder,
} from '../../db/vocabularyRepository';
import type { Folder, VocabularyFile } from '../files/types';

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

type FolderFilesPageProps = {
  folderId: string;
};

export function FolderFilesPage({ folderId }: FolderFilesPageProps) {
  const [folder, setFolder] = useState<Folder | null>(null);
  const [files, setFiles] = useState<VocabularyFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadFolder() {
      try {
        const [loadedFolder, loadedFiles] = await Promise.all([
          getFolder(folderId),
          listVocabularyFilesByFolder(folderId),
        ]);

        if (isMounted) {
          setFolder(loadedFolder);
          setFiles(loadedFiles);
        }
      } catch {
        if (isMounted) {
          setMessage('This folder could not be loaded.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadFolder();

    return () => {
      isMounted = false;
    };
  }, [folderId]);

  return (
    <main className="app-shell">
      <header className="page-header">
        <a className="back-link" href={routes.home}>
          wooord
        </a>
        <p className="eyebrow">Folder</p>
      </header>

      <section className="content-card" aria-label="Folder files">
        {isLoading ? (
          <p className="empty-state">Loading folder...</p>
        ) : folder ? (
          <>
            <h1 className="page-title">{folder.name}</h1>
            {message ? <p className="form-message">{message}</p> : null}
            {files.length > 0 ? (
              <ul className="file-list">
                {files.map((file) => (
                  <li key={file.id}>
                    <a className="file-list-link" href={routes.file(file.id)}>
                      <span className="file-list-title">{file.title}</span>
                      <span className="file-list-meta">
                        {formatDisplayDate(file.createdAt)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No files in this folder yet.</p>
            )}
          </>
        ) : (
          <p className="empty-state">This folder was not found.</p>
        )}
      </section>
    </main>
  );
}
