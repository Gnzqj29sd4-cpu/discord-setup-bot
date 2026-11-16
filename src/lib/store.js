'use strict';

const fs = require('node:fs');
const path = require('node:path');

// Stockage JSON simple : XP et giveaways. Pas de base de données à installer,
// et le dossier data/ n'est pas versionné.
const dataDir = path.join(__dirname, '..', '..', 'data');

function fileFor(name) {
  return path.join(dataDir, `${name}.json`);
}

function read(name) {
  try {
    const parsed = JSON.parse(fs.readFileSync(fileFor(name), 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function write(name, value) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(fileFor(name), JSON.stringify(value, null, 2), 'utf8');
  } catch (error) {
    console.warn(`[store] écriture impossible (${name}) :`, error.message);
  }
}

// --- XP ----------------------------------------------------------------------
function addXp(guildId, userId, amount) {
  const all = read('xp');
  const guild = all[guildId] ?? {};
  guild[userId] = (guild[userId] ?? 0) + amount;
  all[guildId] = guild;
  write('xp', all);
  return guild[userId];
}

function getXp(guildId, userId) {
  const all = read('xp');
  return all[guildId]?.[userId] ?? 0;
}

/** Les 10 premiers du serveur, du plus haut au plus bas. */
function topXp(guildId, limit = 10) {
  const all = read('xp');
  const guild = all[guildId] ?? {};
  return Object.entries(guild)
    .map(([userId, points]) => ({ userId, points }))
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);
}

// --- Giveaways ---------------------------------------------------------------
function saveGiveaway(giveaway) {
  const all = read('giveaways');
  all[giveaway.messageId] = giveaway;
  write('giveaways', all);
}

function getGiveaway(messageId) {
  return read('giveaways')[messageId] ?? null;
}

function updateGiveaway(messageId, patch) {
  const all = read('giveaways');
  if (!all[messageId]) return null;
  all[messageId] = { ...all[messageId], ...patch };
  write('giveaways', all);
  return all[messageId];
}

/** Giveaways encore ouverts, pour les reprogrammer au redémarrage. */
function activeGiveaways() {
  return Object.values(read('giveaways')).filter((giveaway) => !giveaway.ended);
}

module.exports = {
  addXp,
  getXp,
  topXp,
  saveGiveaway,
  getGiveaway,
  updateGiveaway,
  activeGiveaways,
};
