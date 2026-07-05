import { useEffect, useMemo, useState } from 'react';
import { routes } from '../../app/routes';
import {
  listFolders,
  listVocabularyFiles,
} from '../../db/vocabularyRepository';
import type { Folder, VocabularyFile } from './types';

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export function FileListPage() {
  const [files, setFiles] = useState<VocabularyFile[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadLandingData() {
      try {
        const [loadedFiles, loadedFolders] = await Promise.all([
          listVocabularyFiles(),
          listFolders(),
        ]);

        if (isMounted) {
          setFiles(loadedFiles);
          setFolders(loadedFolders);
        }
      } catch {
        if (isMounted) {
          setMessage('Saved files could not be loaded.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadLandingData();

    return () => {
      isMounted = false;
    };
  }, []);

  const folderNamesById = useMemo(() => {
    return new Map(folders.map((folder) => [folder.id, folder.name]));
  }, [folders]);

  return (
    <main className="app-shell">
      <section className="home-panel" aria-labelledby="app-title">
        <p className="eyebrow">Dutch - Chinese vocabulary</p>
        <h1 id="app-title">wooord</h1>
        <p className="intro">
          Local Dutch-Chinese vocabulary files for review and listening.
        </p>

        <nav className="quick-actions" aria-label="Primary">
          <a className="primary-action" href={routes.newFile}>
            New file
          </a>
          <button
            className="secondary-action action-button"
            type="button"
            disabled
          >
            New folder
          </button>
          <a className="secondary-action" href={routes.data}>
            Data
          </a>
        </nav>
      </section>

      {message ? <p className="form-message">{message}</p> : null}

      {folders.length > 0 ? (
        <section className="content-section" aria-labelledby="folders-heading">
          <div className="section-heading">
            <h2 id="folders-heading">Folders</h2>
          </div>
          <ul className="folder-list">
            {folders.map((folder) => (
              <li key={folder.id}>
                <span>{folder.name}</span>
                <small>{formatDisplayDate(folder.updatedAt)}</small>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="content-section" aria-labelledby="files-heading">
        <div className="section-heading">
          <h2 id="files-heading">Files</h2>
          <a className="text-link" href={routes.newFile}>
            Create
          </a>
        </div>

        {isLoading ? (
          <p className="empty-state">Loading files...</p>
        ) : files.length > 0 ? (
          <ul className="file-list">
            {files.map((file) => (
              <li key={file.id}>
                <a className="file-list-link" href={routes.file(file.id)}>
                  <span className="file-list-title">{file.title}</span>
                  <span className="file-list-meta">
                    {formatDisplayDate(file.updatedAt)}
                    {file.folderId && folderNamesById.has(file.folderId)
                      ? ` - ${folderNamesById.get(file.folderId)}`
                      : ''}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">
            No vocabulary files yet. Create a file to start building your local
            study list.
          </p>
        )}
      </section>
    </main>
  );
}
