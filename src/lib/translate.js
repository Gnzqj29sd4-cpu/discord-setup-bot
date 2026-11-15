'use strict';

const { languages } = require('../config');

// Services de traduction publics, gratuits, sans clé ni compte.
const GOOGLE_ENDPOINT = 'https://translate.googleapis.com/translate_a/single';
const MYMEMORY_ENDPOINT = 'https://api.mymemory.translated.net/get';

/** Coupe un texte long en blocs, sans dépasser la limite envoyée au service. */
function splitText(text, maxLength = 1800) {
  if (text.length <= maxLength) return [text];

  const chunks = [];
  let current = '';

  for (const line of text.split('\n')) {
    if (line.length > maxLength) {
      for (let index = 0; index < line.length; index += maxLength) {
        chunks.push(line.slice(index, index + maxLength));
      }
      continue;
    }
    if (current.length + line.length + 1 > maxLength) {
      chunks.push(current);
      current = line;
    } else {
      current = current ? `${current}\n${line}` : line;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

async function translateChunk(text, target) {
  // 1) Google (auto-détection fiable, gratuit, sans clé)
  try {
    const url =
      `${GOOGLE_ENDPOINT}?client=gtx&sl=auto&tl=${encodeURIComponent(target)}` +
      `&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DiscordTranslationBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      const data = await response.json();
      const translated = Array.isArray(data?.[0])
        ? data[0].map((part) => part?.[0] ?? '').join('')
        : '';
      if (translated) {
        return { translated, detected: typeof data?.[2] === 'string' ? data[2] : null };
      }
    }
  } catch (error) {
    console.warn('[traduction] Google indisponible :', error.message);
  }

  // 2) MyMemory (secours, gratuit, sans clé)
  try {
    const url =
      `${MYMEMORY_ENDPOINT}?q=${encodeURIComponent(text.slice(0, 450))}` +
      `&langpair=autodetect%7C${encodeURIComponent(target)}`;

    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (response.ok) {
      const data = await response.json();
      const translated = data?.responseData?.translatedText;
      if (translated && !/MYMEMORY WARNING/i.test(translated)) {
        const detected = data?.responseData?.detectedLanguage;
        return {
          translated,
          detected: typeof detected === 'string' ? detected : null,
        };
      }
    }
  } catch (error) {
    console.warn('[traduction] MyMemory indisponible :', error.message);
  }

  throw new Error('Les services de traduction sont indisponibles, réessaie dans un instant.');
}

/**
 * Traduit un texte vers `target` (code ISO : fr, en, es…).
 * Renvoie { text, detected } où `detected` est la langue d'origine détectée.
 */
async function translate(text, target, maxLength = 1800) {
  const chunks = splitText(String(text).trim(), maxLength);
  const parts = [];
  let detected = null;

  for (const chunk of chunks) {
    const result = await translateChunk(chunk, target);
    parts.push(result.translated);
    if (!detected) detected = result.detected;
  }

  return { text: parts.join('\n'), detected };
}

/** Trouve une langue de config.js par son code ISO ou son nom. */
function findLanguage(value) {
  if (!value) return null;
  const needle = String(value).toLowerCase();
  return (
    languages.find(
      (language) =>
        language.code.toLowerCase() === needle || language.label.toLowerCase() === needle,
    ) ?? null
  );
}

module.exports = { translate, findLanguage, splitText };
