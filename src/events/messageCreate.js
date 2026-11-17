'use strict';

const { AttachmentBuilder } = require('discord.js');
const { hasMedia, buildFramedEmbeds, pickMedia } = require('../lib/branding');
const { detectLanguage } = require('../lib/detect');
const { frameImage, frameAvailable } = require('../lib/frame');
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
 * Photo dans le cadre : télécharge l'image, la colle dans le cadre avec le
 * pseudo, et renvoie le résultat en pièce jointe. true si le message est traité.
 */
async function applyFrame(message) {
  const media = pickMedia(message);
  if (!media) return false;
  if (!(media.contentType ?? '').startsWith('image/')) return false;

  if (!(await frameAvailable())) return false;

  const response = await fetch(media.url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) return false;

  const source = Buffer.from(await response.arrayBuffer());
  const nickname = message.member?.displayName ?? message.author.username;
  const framed = await frameImage(source, nickname);
  if (!framed) return false;

  const file = new AttachmentBuilder(framed, { name: 'cortisolclips.png' });
  await message.reply({ files: [file], allowedMentions: { repliedUser: false } });
  return true;
}

/**
 * 1. Rôle de langue automatique + XP.
 * 2. Photo → collée dans le cadre CortisolClips, avec le pseudo.
 * 3. Sinon (vidéo, ou cadre absent) → bannière + média encadré.
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

    if (!branding.enabled) return;
    if (branding.channels.length > 0 && !branding.channels.includes(message.channel?.name)) {
      return;
    }
    if (!hasMedia(message)) return;

    // 1. Photo : collage automatique dans le cadre.
    try {
      if (await applyFrame(message)) return;
    } catch (error) {
      console.warn('[cadre] collage impossible :', error.message);
    }

    // 2. Repli : bannière + média encadré.
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
