import { useState } from 'react';
import { routes } from '../../app/routes';
import { downloadWooordDatabaseExport } from './databaseExportImport';

export function DataPage() {
  const [message, setMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);

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
            disabled={isExporting}
          >
            Export database
          </button>
        </div>

        {message ? <p className="form-message">{message}</p> : null}
      </section>
    </main>
  );
}
