import type {
  Folder,
  VocabularyEntry,
  VocabularyFile,
} from '../files/types';

export type WooordDatabaseExport = {
  app: 'wooord';
  version: 1;
  exportedAt: string;
  data: {
    folders: Folder[];
    files: VocabularyFile[];
    entries: VocabularyEntry[];
  };
};
