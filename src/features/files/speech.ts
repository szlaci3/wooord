type SpeakChineseOptions = {
  onStart?: () => void;
  onEnd?: () => void;
};

export function speakChinese(text: string, options: SpeakChineseOptions = {}) {
  if (!('speechSynthesis' in window)) {
    return false;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-TW';//CN
  utterance.onstart = options.onStart ?? null;
  utterance.onend = options.onEnd ?? null;
  utterance.onerror = options.onEnd ?? null;

  window.speechSynthesis.speak(utterance);
  return true;
}
