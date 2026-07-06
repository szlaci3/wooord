const storageKey = 'wooord.voicePreferences';

export type VoicePreferences = {
  dutchVoiceURI?: string;
  chineseVoiceURI?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toOptionalString(value: unknown) {
  return typeof value === 'string' && value ? value : undefined;
}

export function getVoicePreferences(): VoicePreferences {
  const storedValue = window.localStorage.getItem(storageKey);

  if (!storedValue) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(storedValue);

    if (!isRecord(parsed)) {
      return {};
    }

    return {
      dutchVoiceURI: toOptionalString(parsed.dutchVoiceURI),
      chineseVoiceURI: toOptionalString(parsed.chineseVoiceURI),
    };
  } catch {
    return {};
  }
}

export function saveVoicePreferences(preferences: VoicePreferences) {
  window.localStorage.setItem(storageKey, JSON.stringify(preferences));
}

