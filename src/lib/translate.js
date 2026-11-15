'use strict';

const { languages } = require('../config');

// Service de traduction public de Google (aucune clé, aucune inscription).
const ENDPOINT = 'https://translate.googleapis.com/translate_a/single';

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
  const url =
    `${ENDPOINT}?client=gtx&sl=auto&tl=${encodeURIComponent(target)}` +
    `&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DiscordTranslationBot/1.0)' },
  });

  if (!response.ok) {
    throw new Error(`Service de traduction indisponible (HTTP ${response.status})`);
  }

  const data = await response.json();
  const translated = Array.isArray(data?.[0])
    ? data[0].map((part) => part?.[0] ?? '').join('')
    : '';

  if (!translated) throw new Error('Le service de traduction a renvoyé une réponse vide.');

  return { translated, detected: typeof data?.[2] === 'string' ? data[2] : null };
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
