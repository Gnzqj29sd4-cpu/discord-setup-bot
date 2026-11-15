'use strict';

const { flags, languages } = require('../config');

/** Les langues proposées en drapeaux, dans l'ordre de config.js. */
function flagLanguages() {
  return flags.languages
    .map((code) => languages.find((language) => language.code === code))
    .filter(Boolean);
}

/** Retrouve la langue correspondant à l'emoji d'une réaction. */
function languageForEmoji(emoji) {
  if (!emoji) return null;
  return flagLanguages().find((language) => language.emoji === emoji) ?? null;
}

module.exports = { flagLanguages, languageForEmoji };
