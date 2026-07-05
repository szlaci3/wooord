# ROADMAP.md

## Roadmap Principle

Build **wooord** milestone by milestone.

Each milestone should leave the app in a usable or clearly inspectable state.

Avoid large unfinished rewrites.

Prefer simple working features over complex abstractions.

Codex should stop after each milestone and wait for the next instruction.

---
## Codex Workflow Rule

When the user says `continue`, Codex should implement the next unfinished milestone in this file.

Codex should work in milestone order.

Do not skip ahead unless all earlier milestones are already fully implemented.

At the start of each run, inspect the current project state and determine the first milestone whose acceptance criteria are not fully satisfied.

Implement that milestone completely.

After finishing, stop and wait for the next `continue` instruction.

---

## Milestone 1: Project Setup and App Shell

Status: Complete.

Goal: create the foundation of the app.

Build:

* Vite React TypeScript project
* basic app shell
* mobile-first layout
* Deep Study Blue theme
* global CSS
* static hosting redirects file
* basic route structure

Required files:

```txt id="cbe5no"
src/styles/theme.css
src/styles/global.css
public/_redirects
```

`public/_redirects` content:

```txt id="zu9903"
/* /index.html 200
```

Theme variables:

```css id="d6boby"
:root {
  --color-bg: #07111f;
  --color-surface: #0f1f33;
  --color-surface-soft: #173451;

  --color-primary: #38bdf8;
  --color-primary-dark: #0284c7;
  --color-primary-soft: #082f49;

  --color-text: #f8fafc;
  --color-text-muted: #cbd5e1;

  --color-border: #2b5f87;
  --color-focus: #7dd3fc;

  --color-danger: #fb7185;
  --color-success: #4ade80;
}
```

Acceptance criteria:

* app runs locally
* app displays the name `wooord`
* layout is mobile-friendly
* background and text use the Deep Study Blue palette
* `_redirects` exists

Stop after this milestone.

---

## Milestone 2: Dexie Database and Domain Types

Status: Complete.

Goal: create the local persistence layer.

Build:

* Dexie database
* domain types
* repository functions for basic read/write

Data entities:

```ts id="6mjn8c"
export type Folder = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type VocabularyFile = {
  id: string;
  title: string;
  folderId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VocabularyEntry = {
  id: string;
  fileId: string;
  dutch: string;
  chinese: string;
  order: number;
};
```

Suggested Dexie schema:

```ts id="1akmci"
this.version(1).stores({
  folders: 'id, name, createdAt, updatedAt',
  files: 'id, title, folderId, createdAt, updatedAt',
  entries: 'id, fileId, order',
});
```

Build repository functions for:

* creating a file with entries
* listing files
* reading one file with entries
* updating a file
* creating a folder
* listing folders

Acceptance criteria:

* database opens without errors
* files, entries, and folders can be created through repository functions
* repository functions hide Dexie details from UI components

Stop after this milestone.

---

## Milestone 3: Vocabulary Parser

Status: Complete.

Goal: parse pasted Dutch-Chinese vocabulary text.

Build:

```txt id="urcvl1"
src/features/files/parseVocabulary.ts
```

Parsing behavior:

* one pair per line
* detect first Chinese character
* Dutch expression is before the first Chinese character
* Chinese translation is from the first Chinese character onward
* ignore empty lines
* skip invalid lines
* preserve order

Example input:

```txt id="za5kqk"
natuurlijk  当然
bestel订购
zalig舒服的
heerlijk舒服的，很棒的
```

Expected output:

```ts id="pjhd73"
[
  { dutch: 'natuurlijk', chinese: '当然' },
  { dutch: 'bestel', chinese: '订购' },
  { dutch: 'zalig', chinese: '舒服的' },
  { dutch: 'heerlijk', chinese: '舒服的，很棒的' }
]
```

Recommended return shape:

```ts id="i7xgr8"
type ParseVocabularyResult = {
  entries: ParsedVocabularyEntry[];
  skippedLines: string[];
};
```

Acceptance criteria:

* parser handles lines with spaces
* parser handles lines with no separator
* parser returns valid entries in original order
* parser reports skipped invalid lines

Stop after this milestone.

---

## Milestone 4: Create and Save Files

Status: Complete.

Goal: allow user to paste vocabulary text and save it as a file.

Build:

* New File page
* large textarea
* icon-only save button
* parser integration
* Dexie save integration
* generated file title

Title format:

```txt id="u5tlkz"
[first Dutch word] — YYYY-MM-DD
```

Example:

```txt id="l5xgd7"
natuurlijk — 2026-07-05
```

Save flow:

1. user pastes raw text
2. taps save icon
3. app parses text
4. app validates at least one entry exists
5. app creates file title
6. app saves file and entries in Dexie
7. app opens the saved file

Acceptance criteria:

* user can paste the sample vocabulary list
* user can save it
* a file is created in IndexedDB
* entries are saved in order
* app navigates to the opened file view
* empty or invalid input shows a readable message

Stop after this milestone.

---

## Milestone 5: Landing Page File List

Status: Complete.

Goal: show saved files on the landing page.

Build landing page with:

* app title `wooord`
* link/button to create a new file
* link/button to create a new folder
* link/button to open Data page
* list of existing files
* list of folders if any exist

File list item should show:

* title
* created or updated date
* folder if useful

Acceptance criteria:

* saved files appear on landing page
* tapping a file opens it
* Data page is reachable
* new file page is reachable
* empty state is readable when no files exist

Stop after this milestone.

---

## Milestone 6: Open File and Listen to Chinese

Status: Complete.

Goal: display a saved file and make Chinese translations audible.

Build:

* File View page
* file title
* ordered vocabulary entries
* Dutch expression
* Chinese translation
* speaker/audio icon
* tappable Chinese text or icon
* small top edit icon with no text

Speech behavior:

```ts id="8j40oc"
utterance.lang = 'zh-CN';
```

Recommended helper:

```ts id="x8fxjy"
export function speakChinese(text: string) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';

  window.speechSynthesis.speak(utterance);
}
```

Acceptance criteria:

* opened file shows all entries
* Chinese translations are easy to tap
* tapping Chinese text or speaker icon attempts audio playback
* edit icon appears near the top
* there are no large bottom `Bewerken` or `Opslaan` buttons

Stop after this milestone.

---

## Milestone 7: Edit Existing File

Status: Complete.

Goal: allow user to edit saved files.

Build one of these:

Preferred first version:

* edit mode inside File View page

Or:

* separate Edit File page

Simplest editing model:

1. reconstruct raw text from current entries
2. show textarea
3. allow title editing
4. save icon appears near the top
5. on save, parse textarea
6. update file metadata
7. replace old entries with new parsed entries

View/edit top action rule:

```txt id="l892qr"
view mode = edit icon
edit mode = save icon
```

No visible text label is needed on the icon.

Accessibility labels are still required.

Acceptance criteria:

* user can enter edit mode
* user can edit file title
* user can edit vocabulary content
* save updates the Dexie data
* file view reflects updated content
* invalid edited content shows a readable message

Stop after this milestone.

---

## Milestone 8: Folders

Status: Complete.

Goal: organize files into folders.

Build:

* create folder
* list folders
* assign file to folder
* show files by folder

Keep folders simple.

Rules:

* no nested folders
* one file can belong to zero or one folder
* deleting folders can be delayed unless easy

Acceptance criteria:

* user can create a folder
* user can move/add a file into a folder
* landing page shows folders
* user can open a folder and see its files
* existing files without folder still remain visible

Stop after this milestone.

---

## Milestone 9: Data Page Route and Export

Goal: create Data page and allow JSON backup export.

Build route:

```txt id="59s4zs"
/data
```

Build page:

```txt id="16ywzg"
DataPage
```

Add button:

```txt id="8hkesq"
Export database
```

Export shape:

```ts id="oo9wco"
{
  app: 'wooord';
  version: 1;
  exportedAt: string;
  data: {
    folders: Folder[];
    files: VocabularyFile[];
    entries: VocabularyEntry[];
  };
}
```

Filename pattern:

```txt id="swwu61"
wooord-backup-YYYY-MM-DD.json
```

Acceptance criteria:

* Data page opens
* export button downloads JSON
* JSON contains folders, files, and entries
* export includes app name and version
* export does not require backend

Stop after this milestone.

---

## Milestone 10: Import Database, Replace Current Data

Goal: import a backup and replace the current local database.

Add button:

```txt id="l1ff5x"
Import database, replace current data
```

Required flow:

1. user selects JSON file
2. app reads file
3. app parses JSON
4. app validates export shape
5. app asks for confirmation
6. app clears current app-owned tables
7. app imports folders, files, entries
8. app refreshes UI

Confirmation copy:

```txt id="8hsawx"
This will replace all current wooord data on this device. Continue?
```

Validation happens before deletion.

Clear order:

```txt id="0xxpj1"
entries
files
folders
```

Import order:

```txt id="4yg1g9"
folders
files
entries
```

Acceptance criteria:

* invalid JSON does not affect current data
* incompatible JSON does not affect current data
* canceling confirmation does not affect current data
* valid import replaces current data
* imported files appear on landing page

Stop after this milestone.

---

## Milestone 11: Add Existing Database, Preserve Current Data

Goal: merge a backup into the current database without deleting current data.

Add button:

```txt id="xovbbw"
Add existing database, preserve current data
```

Required behavior:

* validate import first
* preserve existing data
* import incoming data as additional data
* do not overwrite existing records
* do not delete existing records

Recommended first implementation:

* generate new IDs for every imported folder
* generate new IDs for every imported file
* generate new IDs for every imported entry
* remap file-folder relationships
* remap entry-file relationships

Acceptance criteria:

* current data remains after merge
* imported files are added
* imported entries point to imported files
* imported files point to remapped imported folders when needed
* ID conflicts do not overwrite existing records
* invalid import does nothing

Stop after this milestone.

---

## Milestone 12: Polish and Hardening

Goal: improve usability and reliability.

Improve:

* empty states
* loading states
* error messages
* import/export success feedback
* active audio/listening state
* duplicate title handling
* folder assignment UI
* mobile spacing
* accessibility labels
* focus states
* button contrast
* textarea readability

Acceptance criteria:

* app feels clean and stable on mobile
* important buttons have accessible labels
* import/export gives clear feedback
* no obvious layout problems on small screens
* core flows are easy to understand

Stop after this milestone.

---

## Later Ideas

Do not build these in the first milestones unless explicitly requested.

Possible future features:

* flashcard mode
* spaced repetition
* search across files
* tags
* nested folders
* cloud sync
* optional PWA installation
* pronunciation practice
* AI-assisted parsing
* OCR from screenshots
* export selected folder only
* duplicate detection
* import preview before merge
