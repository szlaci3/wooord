import { type ChangeEvent, useRef, useState } from 'react';
import { routes } from '../../app/routes';
import {
  downloadWooordDatabaseExport,
  mergeWooordDatabase,
  readWooordExportFile,
  replaceWooordDatabase,
} from './databaseExportImport';

export function DataPage() {
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const mergeInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  async function handleExport() {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    setMessage('');

    try {
      await downloadWooordDatabaseExport();
      setMessage('Database export started.');
    } catch {
      setMessage('The database could not be exported. Try again.');
    } finally {
      setIsExporting(false);
    }
  }

  function handleReplaceClick() {
    replaceInputRef.current?.click();
  }

  function handleMergeClick() {
    mergeInputRef.current?.click();
  }

  async function handleReplaceFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file || isImporting) {
      return;
    }

    setIsImporting(true);
    setMessage('');

    try {
      const backup = await readWooordExportFile(file);
      const confirmed = window.confirm(
        'This will replace all current wooord data on this device. Continue?',
      );

      if (!confirmed) {
        setMessage('Import canceled. Current data was not changed.');
        return;
      }

      await replaceWooordDatabase(backup);
      setMessage('Database import complete.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Import failed.');
    } finally {
      setIsImporting(false);
    }
  }

  async function handleMergeFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file || isImporting) {
      return;
    }

    setIsImporting(true);
    setMessage('');

    try {
      const backup = await readWooordExportFile(file);

      await mergeWooordDatabase(backup);
      setMessage('Database added. Current data was preserved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Import failed.');
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <a className="back-link" href={routes.home}>
          wooord
        </a>
        <p className="eyebrow">Data</p>
      </header>

      <section className="content-card" aria-labelledby="data-heading">
        <h1 id="data-heading" className="page-title">
          Local data
        </h1>

        <div className="data-actions">
          <button
            className="data-action-button"
            type="button"
            onClick={handleExport}
            disabled={isExporting || isImporting}
          >
            Export database
          </button>
          <button
            className="data-action-button data-action-danger"
            type="button"
            onClick={handleReplaceClick}
            disabled={isExporting || isImporting}
          >
            Import database, replace current data
          </button>
          <input
            ref={replaceInputRef}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            onChange={handleReplaceFile}
          />
          <button
            className="data-action-button"
            type="button"
            onClick={handleMergeClick}
            disabled={isExporting || isImporting}
          >
            Add existing database, preserve current data
          </button>
          <input
            ref={mergeInputRef}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            onChange={handleMergeFile}
          />
        </div>

        {message ? <p className="form-message">{message}</p> : null}
      </section>
    </main>
  );
}
