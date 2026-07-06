import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { routes } from '../../app/routes';
import {
  createFolder,
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
  const [folderName, setFolderName] = useState('');

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

  async function handleCreateFolder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = folderName.trim();

    if (!trimmedName) {
      setMessage('Add a folder name before saving.');
      return;
    }

    try {
      const folder = await createFolder(trimmedName);

      setFolders((currentFolders) => [...currentFolders, folder]);
      setFolderName('');
      setMessage('');
    } catch {
      setMessage('The folder could not be created. Try again.');
    }
  }

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
          <a className="secondary-action" href={routes.data}>
            Data
          </a>
          <a className="secondary-action" href={routes.settings}>
            Settings
          </a>
        </nav>
      </section>

      {message ? <p className="form-message">{message}</p> : null}

      <section className="content-section" aria-labelledby="new-folder-heading">
        <div className="section-heading">
          <h2 id="new-folder-heading">New folder</h2>
        </div>
        <form className="inline-form" onSubmit={handleCreateFolder}>
          <label className="sr-only" htmlFor="folder-name">
            Folder name
          </label>
          <input
            id="folder-name"
            className="text-input"
            value={folderName}
            onChange={(event) => setFolderName(event.target.value)}
            placeholder="Folder name"
          />
          <button className="secondary-action action-button" type="submit">
            Create
          </button>
        </form>
      </section>

      {folders.length > 0 ? (
        <section className="content-section" aria-labelledby="folders-heading">
          <div className="section-heading">
            <h2 id="folders-heading">Folders</h2>
          </div>
          <ul className="folder-list">
            {folders.map((folder) => (
              <li key={folder.id}>
                <a className="folder-list-link" href={routes.folder(folder.id)}>
                  <span>{folder.name}</span>
                  <small>{formatDisplayDate(folder.updatedAt)}</small>
                </a>
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
                <div className="file-list-item">
                  <a className="file-list-link" href={routes.file(file.id)}>
                    <span className="file-list-title">{file.title}</span>
                    <span className="file-list-meta">
                      {formatDisplayDate(file.createdAt)}
                      {file.folderId && folderNamesById.has(file.folderId)
                        ? ` - ${folderNamesById.get(file.folderId)}`
                        : ''}
                    </span>
                  </a>
                  <a
                    className="file-list-study-link"
                    href={routes.flashcards(file.id)}
                  >
                    Flashcards
                  </a>
                </div>
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
