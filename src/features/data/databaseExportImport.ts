import { db } from '../../db/db';
import type { WooordDatabaseExport } from './types';

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function createBackupFilename(date = new Date()) {
  return `wooord-backup-${formatLocalDate(date)}.json`;
}

export async function exportWooordDatabase(): Promise<WooordDatabaseExport> {
  const [folders, files, entries] = await Promise.all([
    db.folders.toArray(),
    db.files.toArray(),
    db.entries.toArray(),
  ]);

  return {
    app: 'wooord',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      folders,
      files,
      entries,
    },
  };
}

export async function downloadWooordDatabaseExport() {
  const backup = await exportWooordDatabase();
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = createBackupFilename();
  link.click();
  URL.revokeObjectURL(url);
}
