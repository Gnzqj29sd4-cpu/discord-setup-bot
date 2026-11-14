'use strict';

const { EmbedBuilder } = require('discord.js');
const { languages } = require('../config');

// Service de traduction public de Google (aucune clé nécessaire).
const ENDPOINT = 'https://translate.googleapis.com/translate_a/single';

// Cache mémoire : `${messageId}:${code}` → traduction, pour ne pas rappeler
// le service quand plusieurs personnes cliquent le même drapeau.
const cache = new Map();
const CACHE_MAX = 500;

function remember(key, value) {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
  cache.set(key, value);
}

function getCached(key) {
  return cache.get(key);
}

/** Coupe un texte long en blocs de `maxLength` caractères, sans casser les lignes. */
function splitText(text, maxLength = 1800) {
  if (text.length <= maxLength) return [text];

  const chunks = [];
  let current = '';

  for (const line of text.split('\n')) {
    if (line.length > maxLength) {
      // Une seule ligne énorme : on coupe brutalement.
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

  if (!translated) throw new Error('Traduction vide : le service a renvoyé une réponse inattendue.');

  return { translated, detected: typeof data?.[2] === 'string' ? data[2] : null };
}

/**
 * Traduit un texte vers `target` (code ISO : fr, en, es…).
 * Renvoie { text, detected } où `detected` est la langue d'origine détectée.
 */
async function translate(text, target, maxLength = 1800) {
  const chunks = splitText(text.trim(), maxLength);
  const parts = [];
  let detected = null;

  for (const chunk of chunks) {
    const result = await translateChunk(chunk, target);
    parts.push(result.translated);
    if (!detected) detected = result.detected;
  }

  return { text: parts.join('\n'), detected };
}

/** Trouve une langue de config.js par son code ISO, sa clé ou son libellé. */
function findLanguage(value) {
  if (!value) return null;
  const needle = String(value).toLowerCase();
  return (
    languages.find(
      (language) =>
        language.code.toLowerCase() === needle ||
        language.key.toLowerCase() === needle ||
        language.label.toLowerCase() === needle,
    ) ?? null
  );
}

/** Trouve une langue à partir de l'emoji d'une réaction (le drapeau). */
function findLanguageByEmoji(emoji) {
  if (!emoji) return null;
  return languages.find((language) => language.emoji === emoji) ?? null;
}

/** Nom lisible d'un code ISO détecté, pour l'afficher dans l'embed. */
function languageLabel(code) {
  if (!code) return 'langue inconnue';
  const language = findLanguage(code);
  return language ? `${language.emoji} ${language.label}` : code.toUpperCase();
}

/** Embed de réponse : le texte d'origine et sa traduction. */
function buildTranslationEmbed({ original, translated, detected, target }) {
  const language = findLanguage(target);

  const source =
    original.length > 1000 ? `${original.slice(0, 1000)}…` : original;
  const result =
    translated.length > 3900 ? `${translated.slice(0, 3900)}…` : translated;

  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setAuthor({
      name: `Traduit vers ${language ? `${language.emoji} ${language.label}` : target}`,
    })
    .setDescription(result)
    .addFields({
      name: `Texte d'origine (${languageLabel(detected)})`,
      value: source || '*vide*',
    })
    .setFooter({ text: 'Traduction automatique : peut contenir des imprécisions.' });
}

/**
 * Traduit le contenu d'un message vers `code`, en passant par le cache pour
 * ne pas rappeler le service quand plusieurs personnes cliquent le même drapeau.
 */
async function translateMessage(message, code, maxLength = 1800) {
  const key = `${message.id}:${code}`;
  const cached = getCached(key);
  if (cached) return cached;

  const result = await translate(message.content, code, maxLength);
  remember(key, result);
  return result;
}

module.exports = {
  translate,
  translateMessage,
  findLanguage,
  findLanguageByEmoji,
  languageLabel,
  buildTranslationEmbed,
  splitText,
  getCached,
  remember,
};
