'use strict';

const fs = require('node:fs');
const path = require('node:path');

// Petites préférences persistées (langue choisie par chaque membre).
// Le dossier data/ est créé au premier démarrage et n'est pas versionné.
const dataDir = path.join(__dirname, '..', '..', 'data');
const file = path.join(dataDir, 'preferences.json');

function readAll() {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

/** Langue préférée d'un membre (code ISO) ou null. */
function getUserLanguage(userId) {
  const data = readAll();
  return data[userId]?.language ?? null;
}

/** Enregistre la langue préférée d'un membre. */
function setUserLanguage(userId, code) {
  const data = readAll();
  data[userId] = { ...(data[userId] ?? {}), language: code };
  writeAll(data);
}

module.exports = { getUserLanguage, setUserLanguage };
