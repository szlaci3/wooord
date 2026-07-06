import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { routes } from '../../app/routes';
import {
  getVoicePreferences,
  saveVoicePreferences,
  type VoicePreferences,
} from './voicePreferences';
import { listLanguageVoices } from './voiceSelection';

function canUseSpeechSynthesis() {
  return (
    'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  );
}

function loadVoices() {
  if (!canUseSpeechSynthesis()) {
    return [];
  }

  return window.speechSynthesis.getVoices();
}

export function SettingsPage() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() =>
    loadVoices(),
  );
  const [preferences, setPreferences] = useState<VoicePreferences>(() =>
    getVoicePreferences(),
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!canUseSpeechSynthesis()) {
      return;
    }

    function handleVoicesChanged() {
      setVoices(loadVoices());
    }

    handleVoicesChanged();
    window.speechSynthesis.addEventListener(
      'voiceschanged',
      handleVoicesChanged,
    );

    return () => {
      window.speechSynthesis.removeEventListener(
        'voiceschanged',
        handleVoicesChanged,
      );
    };
  }, []);

  const dutchVoices = useMemo(
    () => listLanguageVoices(voices, 'dutch'),
    [voices],
  );
  const chineseVoices = useMemo(
    () => listLanguageVoices(voices, 'chinese'),
    [voices],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveVoicePreferences(preferences);
    setMessage('Voice settings saved.');
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <a className="back-link" href={routes.home}>
          wooord
        </a>
        <p className="eyebrow">Settings</p>
      </header>

      <form
        className="content-card settings-form"
        aria-labelledby="settings-heading"
        onSubmit={handleSubmit}
      >
        <h1 id="settings-heading" className="page-title">
          Voice settings
        </h1>

        {!canUseSpeechSynthesis() ? (
          <p className="form-message" role="alert">
            Speech synthesis is not available in this browser.
          </p>
        ) : null}

        <label className="settings-field" htmlFor="dutch-voice">
          <span>Dutch voice</span>
          <select
            id="dutch-voice"
            className="select-input"
            value={preferences.dutchVoiceURI ?? ''}
            onChange={(event) =>
              setPreferences((currentPreferences) => ({
                ...currentPreferences,
                dutchVoiceURI: event.target.value || undefined,
              }))
            }
          >
            <option value="">Automatic - prefer Belgian Dutch</option>
            {dutchVoices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
          <small>
            Dutch voices such as nl-BE and nl-NL appear when your browser
            exposes them.
          </small>
        </label>

        <label className="settings-field" htmlFor="chinese-voice">
          <span>Chinese voice</span>
          <select
            id="chinese-voice"
            className="select-input"
            value={preferences.chineseVoiceURI ?? ''}
            onChange={(event) =>
              setPreferences((currentPreferences) => ({
                ...currentPreferences,
                chineseVoiceURI: event.target.value || undefined,
              }))
            }
          >
            <option value="">Automatic - prefer Mandarin Chinese</option>
            {chineseVoices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
          <small>
            Taiwan voices such as zh-TW are selectable when your browser
            exposes them.
          </small>
        </label>

        <button className="data-action-button" type="submit">
          Save voice settings
        </button>

        {message ? (
          <p className="form-message form-message-success" role="status">
            {message}
          </p>
        ) : null}
      </form>
    </main>
  );
}

