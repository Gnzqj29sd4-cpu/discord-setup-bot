'use strict';

const { hasMedia, buildFramedEmbeds } = require('../lib/branding');
const { detectLanguage } = require('../lib/detect');
const { branding, xp: xpConfig, languageRoles } = require('../config');
const { addXp } = require('../lib/store');

// Délai entre deux gains d'XP, par membre et par serveur.
const cooldowns = new Map();

function awardXp(message) {
  if (!xpConfig.enabled) return;

  const key = `${message.guild.id}:${message.author.id}`;
  const now = Date.now();
  if (now - (cooldowns.get(key) ?? 0) < xpConfig.cooldownMs) return;
  cooldowns.set(key, now);

  const amount =
    Math.floor(Math.random() * (xpConfig.max - xpConfig.min + 1)) + xpConfig.min;
  addXp(message.guild.id, message.author.id, amount);
}

/** Donne le rôle de langue correspondant à la langue détectée. */
async function awardLanguageRole(message) {
  const language = detectLanguage(message.content);
  const roleId = language ? languageRoles[language] : null;
  if (!roleId) return;

  if (message.member?.roles?.cache?.has(roleId)) return;

  const role = await message.guild.roles.fetch(roleId).catch(() => null);
  if (!role) return;

  await message.member.roles
    .add(role, 'Language detected automatically')
    .catch((error) => console.warn('[langue] rôle non attribué :', error.message));
}

/**
 * 1. Rôle de langue automatique + XP.
 * 2. Cadrage automatique des photos et vidéos dans les salons de clips.
 */
module.exports = {
  name: 'messageCreate',

  async execute(message) {
    if (message.author.bot || message.system) return;
    if (!message.guild) return;

    // XP et langue : sur tous les messages écrits.
    if (message.content && message.content.trim().length > 0) {
      awardXp(message);
      await awardLanguageRole(message);
    }

    // Cadrage : seulement les photos et vidéos.
    if (!branding.enabled) return;
    if (branding.channels.length > 0 && !branding.channels.includes(message.channel?.name)) {
      return;
    }
    if (!hasMedia(message)) return;

    try {
      await message.reply({
        embeds: buildFramedEmbeds(message),
        allowedMentions: { repliedUser: false },
      });
    } catch (error) {
      console.warn('[branding] framed message not sent:', error.message);
    }
  },
};
