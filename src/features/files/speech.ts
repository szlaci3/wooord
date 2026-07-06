import { getVoicePreferences } from '../settings/voicePreferences';
import {
  selectLanguageVoice,
  type VoiceLanguage,
} from '../settings/voiceSelection';

type SpeakChineseOptions = {
  onStart?: () => void;
  onEnd?: () => void;
};

const fallbackLanguageByVoiceLanguage: Record<VoiceLanguage, string> = {
  chinese: 'zh-CN',
  dutch: 'nl-BE',
};

function speakLanguage(
  text: string,
  language: VoiceLanguage,
  options: SpeakChineseOptions = {},
) {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    return false;
  }

  window.speechSynthesis.cancel();

  const preferences = getVoicePreferences();
  const preferredVoiceURI =
    language === 'dutch'
      ? preferences.dutchVoiceURI
      : preferences.chineseVoiceURI;
  const voice = selectLanguageVoice(
    window.speechSynthesis.getVoices(),
    language,
    preferredVoiceURI,
  );
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voice?.lang ?? fallbackLanguageByVoiceLanguage[language];
  utterance.voice = voice;
  utterance.onstart = options.onStart ?? null;
  utterance.onend = options.onEnd ?? null;
  utterance.onerror = options.onEnd ?? null;

  window.speechSynthesis.speak(utterance);
  return true;
}

export function speakChinese(text: string, options: SpeakChineseOptions = {}) {
  return speakLanguage(text, 'chinese', options);
}

export function speakDutch(text: string, options: SpeakChineseOptions = {}) {
  return speakLanguage(text, 'dutch', options);
}
