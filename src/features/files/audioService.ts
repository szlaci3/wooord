import { getVoicePreferences } from '../settings/voicePreferences';
import {
  selectLanguageVoice,
  type VoiceLanguage,
} from '../settings/voiceSelection';

export type PlayAudioOptions = {
  onStart?: () => void;
  onEnd?: () => void;
};

const wiktionaryApiUrl = 'https://en.wiktionary.org/w/api.php';
const commonsRedirectBaseUrl =
  'https://commons.wikimedia.org/wiki/Special:Redirect/file/';

const fallbackLanguageByVoiceLanguage: Record<VoiceLanguage, string> = {
  chinese: 'zh-CN',
  dutch: 'nl-BE',
};

const wiktionaryLanguageCodeByVoiceLanguage: Record<VoiceLanguage, string> = {
  chinese: 'zh',
  dutch: 'nl',
};

const wiktionaryAudioCache = new Map<string, Promise<string | null>>();
let activeHtmlAudio: HTMLAudioElement | null = null;

function stopCurrentAudio() {
  window.speechSynthesis?.cancel();

  if (activeHtmlAudio) {
    activeHtmlAudio.pause();
    activeHtmlAudio.src = '';
    activeHtmlAudio = null;
  }
}

function speakWithSpeechSynthesis(
  text: string,
  language: VoiceLanguage,
  options: PlayAudioOptions = {},
) {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    return false;
  }

  stopCurrentAudio();

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

function normalizeLookupText(text: string) {
  return text
    .trim()
    .replace(/[。！？!?.,，、；;:：()[\]{}"“”'‘’]+$/u, '')
    .trim();
}

function getWiktionaryCacheKey(text: string, language: VoiceLanguage) {
  return `${language}:${text.toLocaleLowerCase()}`;
}

function splitTemplateParts(template: string) {
  return template
    .slice(2, -2)
    .split('|')
    .map((part) => part.trim());
}

function normalizeAudioFileName(fileName: string) {
  return fileName.replace(/^File:/i, '').replace(/^Image:/i, '').trim();
}

function isAudioFileName(value: string) {
  return /\.(oga|ogg|mp3|wav|webm)$/i.test(value);
}

function getAudioFileFromTemplate(
  template: string,
  wiktionaryLanguageCode: string,
) {
  const parts = splitTemplateParts(template);
  const templateName = parts[0]?.toLowerCase();

  if (templateName !== 'audio') {
    return null;
  }

  const languageCode = parts[1]?.toLowerCase();

  if (languageCode !== wiktionaryLanguageCode) {
    return null;
  }

  const fileName = normalizeAudioFileName(parts[2] ?? '');
  return isAudioFileName(fileName) ? fileName : null;
}

function findWiktionaryAudioFile(
  wikitext: string,
  language: VoiceLanguage,
) {
  const wiktionaryLanguageCode =
    wiktionaryLanguageCodeByVoiceLanguage[language];
  const audioTemplates = wikitext.match(/\{\{audio\|[^{}]+}}/gi) ?? [];

  for (const template of audioTemplates) {
    const fileName = getAudioFileFromTemplate(
      template,
      wiktionaryLanguageCode,
    );

    if (fileName) {
      return fileName;
    }
  }

  return null;
}

async function fetchWiktionaryAudioUrl(
  text: string,
  language: VoiceLanguage,
) {
  const url = new URL(wiktionaryApiUrl);
  url.search = new URLSearchParams({
    action: 'parse',
    format: 'json',
    formatversion: '2',
    origin: '*',
    page: text,
    prop: 'wikitext',
    redirects: '1',
  }).toString();

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const result: unknown = await response.json();
    const wikitext =
      typeof result === 'object' &&
      result !== null &&
      'parse' in result &&
      typeof result.parse === 'object' &&
      result.parse !== null &&
      'wikitext' in result.parse &&
      typeof result.parse.wikitext === 'string'
        ? result.parse.wikitext
        : null;

    if (!wikitext) {
      return null;
    }

    const fileName = findWiktionaryAudioFile(wikitext, language);

    if (!fileName) {
      return null;
    }

    return `${commonsRedirectBaseUrl}${encodeURIComponent(fileName)}`;
  } catch {
    return null;
  }
}

function getCachedWiktionaryAudioUrl(
  text: string,
  language: VoiceLanguage,
) {
  const cacheKey = getWiktionaryCacheKey(text, language);
  const cachedValue = wiktionaryAudioCache.get(cacheKey);

  if (cachedValue) {
    return cachedValue;
  }

  const audioUrl = fetchWiktionaryAudioUrl(text, language);
  wiktionaryAudioCache.set(cacheKey, audioUrl);
  return audioUrl;
}

async function playHtmlAudio(url: string, options: PlayAudioOptions) {
  const audio = new Audio(url);
  activeHtmlAudio = audio;

  audio.onended = options.onEnd ?? null;
  audio.onerror = options.onEnd ?? null;

  try {
    options.onStart?.();
    await audio.play();
    return true;
  } catch {
    options.onEnd?.();
    return false;
  }
}

function playWiktionaryOrFallback(
  text: string,
  language: VoiceLanguage,
  options: PlayAudioOptions = {},
) {
  const lookupText = normalizeLookupText(text);

  if (!lookupText) {
    return speakWithSpeechSynthesis(text, language, options);
  }

  stopCurrentAudio();

  void getCachedWiktionaryAudioUrl(lookupText, language).then((audioUrl) => {
    if (!audioUrl) {
      if (!speakWithSpeechSynthesis(text, language, options)) {
        options.onEnd?.();
      }

      return;
    }

    void playHtmlAudio(audioUrl, options).then((didPlay) => {
      if (!didPlay && !speakWithSpeechSynthesis(text, language, options)) {
        options.onEnd?.();
      }
    });
  });

  return true;
}

export function playLanguageAudio(
  text: string,
  language: VoiceLanguage,
  options: PlayAudioOptions = {},
) {
  const preferences = getVoicePreferences();

  if (preferences.audioSource === 'wiktionary') {
    return playWiktionaryOrFallback(text, language, options);
  }

  return speakWithSpeechSynthesis(text, language, options);
}
