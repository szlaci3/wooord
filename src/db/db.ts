import Dexie, { type Table } from 'dexie';
import type {
  Folder,
  VocabularyEntry,
  VocabularyFile,
} from '../features/files/types';

export class WooordDatabase extends Dexie {
  folders!: Table<Folder, string>;
  files!: Table<VocabularyFile, string>;
  entries!: Table<VocabularyEntry, string>;

  constructor() {
    super('wooord-db');

    this.version(1).stores({
      folders: 'id, name, createdAt, updatedAt',
      files: 'id, title, folderId, createdAt, updatedAt',
      entries: 'id, fileId, order',
    });
  }
}

export const db = new WooordDatabase();
