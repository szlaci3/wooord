import { useEffect, useMemo, useState } from 'react';
import { routes } from '../../app/routes';
import { getVocabularyFile } from '../../db/vocabularyRepository';
import { speakChinese, speakDutch } from './speech';
import type { VocabularyEntry, VocabularyFileWithEntries } from './types';

type FlashcardsPageProps = {
  fileId: string;
};

type FlashcardDirection = 'dutch-to-chinese' | 'chinese-to-dutch';

function SpeakerIcon() {
  return (
    <svg
      className="button-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 9v6h4l5 4V5L8 9H4Zm12.6-.7-1.4 1.4A3.2 3.2 0 0 1 16 12c0 .9-.3 1.7-.8 2.3l1.4 1.4A5.1 5.1 0 0 0 18 12c0-1.4-.5-2.7-1.4-3.7Zm2.8-2.8L18 6.9a7.2 7.2 0 0 1 2 5.1c0 2-.8 3.8-2 5.1l1.4 1.4A9.1 9.1 0 0 0 22 12c0-2.5-1-4.8-2.6-6.5Z" />
    </svg>
  );
}

function getFrontText(entry: VocabularyEntry, direction: FlashcardDirection) {
  return direction === 'dutch-to-chinese' ? entry.dutch : entry.chinese;
}

function getBackText(entry: VocabularyEntry, direction: FlashcardDirection) {
  return direction === 'dutch-to-chinese' ? entry.chinese : entry.dutch;
}

function speakFlashcardText(text: string, direction: FlashcardDirection) {
  return direction === 'dutch-to-chinese'
    ? speakDutch(text)
    : speakChinese(text);
}

function speakFlashcardAnswer(text: string, direction: FlashcardDirection) {
  return direction === 'dutch-to-chinese'
    ? speakChinese(text)
    : speakDutch(text);
}

export function FlashcardsPage({ fileId }: FlashcardsPageProps) {
  const [fileData, setFileData] = useState<VocabularyFileWithEntries | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] =
    useState<FlashcardDirection>('dutch-to-chinese');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadFile() {
      try {
        const savedFile = await getVocabularyFile(fileId);

        if (isMounted) {
          setFileData(savedFile);
        }
      } catch {
        if (isMounted) {
          setMessage('Flashcards could not be loaded.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadFile();

    return () => {
      isMounted = false;
    };
  }, [fileId]);

  const entries = fileData?.entries ?? [];
  const currentEntry = entries[currentIndex] ?? null;
  const progressText = useMemo(() => {
    if (entries.length === 0) {
      return '0 / 0';
    }

    return `${currentIndex + 1} / ${entries.length}`;
  }, [currentIndex, entries.length]);

  function changeDirection(nextDirection: FlashcardDirection) {
    setDirection(nextDirection);
    setIsRevealed(false);
  }

  function goToPreviousCard() {
    setCurrentIndex((index) =>
      entries.length > 0 ? (index + entries.length - 1) % entries.length : 0,
    );
    setIsRevealed(false);
  }

  function goToNextCard() {
    setCurrentIndex((index) =>
      entries.length > 0 ? (index + 1) % entries.length : 0,
    );
    setIsRevealed(false);
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <a className="back-link" href={routes.home}>
          wooord
        </a>
        <p className="eyebrow">Flashcards</p>
      </header>

      <section className="content-card" aria-label="Flashcards">
        {isLoading ? (
          <p className="empty-state">Loading flashcards...</p>
        ) : fileData && currentEntry ? (
          <>
            <div className="flashcard-heading">
              <div>
                <h1 className="page-title">{fileData.file.title}</h1>
                <p className="flashcard-progress">{progressText}</p>
              </div>
              <a className="text-link" href={routes.file(fileData.file.id)}>
                File
              </a>
            </div>

            {message ? <p className="form-message">{message}</p> : null}

            <div className="segmented-control" aria-label="Flashcard direction">
              <button
                className={
                  direction === 'dutch-to-chinese'
                    ? 'segment-button segment-button-active'
                    : 'segment-button'
                }
                type="button"
                onClick={() => changeDirection('dutch-to-chinese')}
              >
                Dutch
              </button>
              <button
                className={
                  direction === 'chinese-to-dutch'
                    ? 'segment-button segment-button-active'
                    : 'segment-button'
                }
                type="button"
                onClick={() => changeDirection('chinese-to-dutch')}
              >
                Chinese
              </button>
            </div>

            <button
              className="flashcard-card"
              type="button"
              onClick={() => setIsRevealed((value) => !value)}
              aria-pressed={isRevealed}
            >
              <span className="flashcard-label">
                {isRevealed ? 'Answer' : 'Prompt'}
              </span>
              <span
                className={
                  direction === 'chinese-to-dutch' && !isRevealed
                    ? 'flashcard-text flashcard-text-chinese'
                    : direction === 'dutch-to-chinese' && isRevealed
                      ? 'flashcard-text flashcard-text-chinese'
                      : 'flashcard-text'
                }
              >
                {isRevealed
                  ? getBackText(currentEntry, direction)
                  : getFrontText(currentEntry, direction)}
              </span>
            </button>

            <div className="flashcard-audio-row">
              <button
                className="secondary-action action-button"
                type="button"
                onClick={() =>
                  speakFlashcardText(getFrontText(currentEntry, direction), direction)
                }
              >
                <SpeakerIcon />
                Prompt
              </button>
              <button
                className="secondary-action action-button"
                type="button"
                onClick={() =>
                  speakFlashcardAnswer(getBackText(currentEntry, direction), direction)
                }
              >
                <SpeakerIcon />
                Answer
              </button>
            </div>

            <div className="flashcard-nav-row">
              <button
                className="secondary-action action-button"
                type="button"
                onClick={goToPreviousCard}
              >
                Previous
              </button>
              <button
                className="primary-action action-button"
                type="button"
                onClick={goToNextCard}
              >
                Next
              </button>
            </div>
          </>
        ) : fileData ? (
          <p className="empty-state">This file has no vocabulary entries.</p>
        ) : (
          <p className="empty-state">This file was not found.</p>
        )}
      </section>
    </main>
  );
}
