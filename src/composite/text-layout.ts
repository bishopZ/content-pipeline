const PUNCT_BREAK = /[。，、；：.!?;,]/;

const splitByWords = (text: string): [string, string] => {
  const words = text.split(/\s+/);
  if (words.length === 1) {
    return splitByCharacters(text);
  }

  let bestIndex = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const first = words.slice(0, i).join(' ');
    const second = words.slice(i).join(' ');
    const diff = Math.abs(first.length - second.length);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = i;
    }
  }

  return [words.slice(0, bestIndex).join(' '), words.slice(bestIndex).join(' ')];
};

const splitByCharacters = (text: string): [string, string] => {
  const mid = Math.ceil(text.length / 2);
  const windowStart = Math.max(1, mid - 8);
  const windowEnd = Math.min(text.length - 1, mid + 8);

  for (let i = mid; i >= windowStart; i--) {
    if (PUNCT_BREAK.test(text[i - 1] ?? '')) {
      return [text.slice(0, i).trim(), text.slice(i).trim()];
    }
  }
  for (let i = mid + 1; i <= windowEnd; i++) {
    if (PUNCT_BREAK.test(text[i - 1] ?? '')) {
      return [text.slice(0, i).trim(), text.slice(i).trim()];
    }
  }

  return [text.slice(0, mid).trim(), text.slice(mid).trim()];
};

export const splitBodyIntoTwoLines = (body: string): [string, string] => {
  const text = body.trim();
  if (!text) {
    return ['', ''];
  }

  const explicit = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (explicit.length >= 2) {
    return [explicit[0], explicit.slice(1).join(' ')];
  }

  if (/\s/.test(text)) {
    return splitByWords(text);
  }

  return splitByCharacters(text);
};

export const bodyUsesTwoLines = (aspectRatio: string): boolean =>
  aspectRatio === '9:16' || aspectRatio === '1:1';
