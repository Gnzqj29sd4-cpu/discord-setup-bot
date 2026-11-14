'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { ChannelType, EmbedBuilder } = require('discord.js');
const { tutorials, accessPresets, roleGroups } = require('../config');
const { buildOverwrites, sleep } = require('./permissions');
const { buildRoleMap } = require('./channels');

const REASON = 'Configuration automatique du serveur (/setup tutos)';
const STEP_DELAY = 350;

// Fichier optionnel à la racine du projet : pratique pour lister beaucoup de
// tutoriels sans toucher au code. Voir tutorials.example.json.
const OVERRIDE_FILE = path.join(__dirname, '..', '..', 'tutorials.json');

/** Liste des tutoriels : tutorials.json s'il existe, sinon la liste de config.js. */
function loadItems() {
  try {
    const raw = fs.readFileSync(OVERRIDE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed) ? parsed : parsed.items;
    if (Array.isArray(items) && items.length > 0) return items;
    console.warn('[tutos] tutorials.json ne contient aucun tutoriel : config.js utilisé.');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('[tutos] tutorials.json illisible :', error.message);
    }
  }
  return tutorials.items;
}

/** Embed de présentation d'un tutoriel : titre, explication, étapes, vidéo. */
function buildTutorialEmbed(item, categoryName = tutorials.category) {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`${tutorials.emoji} ${item.title ?? item.name}`)
    .setDescription(
      `${item.description ?? 'Présentation à venir.'}${
        item.video ? `\n\n▶️ **Vidéo :** ${item.video}` : '\n\n▶️ *Vidéo bientôt disponible.*'
      }`,
    )
    .setFooter({ text: `${categoryName} • Tutoriel` });

  if (Array.isArray(item.steps) && item.steps.length > 0) {
    embed.addFields({
      name: 'Étapes',
      value: item.steps
        .map((step, index) => `**${index + 1}.** ${step}`)
        .join('\n')
        .slice(0, 1024),
    });
  }

  if (item.image) embed.setImage(item.image);
  return embed;
}

/** Envoie (ou renvoie) la présentation d'un tutoriel dans son salon. */
async function postPresentation(channel, item) {
  const payload = { embeds: [buildTutorialEmbed(item, channel.parent?.name)] };
  // Le lien brut permet à Discord d'afficher le lecteur vidéo dans le salon.
  if (item.video) payload.content = item.video;

  await channel.send(payload);
}

/** Retrouve la catégorie des tutoriels, la crée si elle manque. */
async function ensureCategory(guild, log = () => {}) {
  const channels = await guild.channels.fetch();
  const existing = channels.find(
    (channel) => channel && channel.type === ChannelType.GuildCategory && channel.name === tutorials.category,
  );
  if (existing) return existing;

  const roleByKey = await buildRoleMap(guild);
  const category = await guild.channels.create({
    name: tutorials.category,
    type: ChannelType.GuildCategory,
    permissionOverwrites: buildOverwrites(
      guild,
      tutorials.access ?? 'readonly',
      roleByKey,
      accessPresets,
      roleGroups,
    ),
    reason: REASON,
  });

  log(`catégorie créée : ${category.name}`);
  return category;
}

/**
 * Crée un salon tutoriel (s'il n'existe pas) et y poste sa présentation.
 * Renvoie { channel, created }.
 */
async function createTutorialChannel(guild, item, log = () => {}) {
  const category = await ensureCategory(guild, log);
  const channels = await guild.channels.fetch();
  const existing = channels.find(
    (channel) => channel && channel.parentId === category.id && channel.name === item.name,
  );

  if (existing) {
    log(`déjà présent : ${existing.name}`);
    return { channel: existing, created: false };
  }

  const roleByKey = await buildRoleMap(guild);
  const channel = await guild.channels.create({
    name: item.name,
    type: ChannelType.GuildText,
    parent: category.id,
    topic: item.description ? item.description.slice(0, 1024) : undefined,
    permissionOverwrites: buildOverwrites(
      guild,
      tutorials.access ?? 'readonly',
      roleByKey,
      accessPresets,
      roleGroups,
    ),
    reason: REASON,
  });

  await postPresentation(channel, item);
  log(`salon créé : ${channel.name}`);
  await sleep(STEP_DELAY);

  return { channel, created: true };
}

/** Crée tous les tutoriels de config.js (ou de tutorials.json). */
async function createAllTutorials(guild, log = () => {}) {
  const created = [];
  const skipped = [];

  for (const item of loadItems()) {
    const { channel, created: isNew } = await createTutorialChannel(guild, item, log);
    if (isNew) created.push(channel.name);
    else skipped.push(channel.name);
  }

  return { created, skipped };
}

module.exports = {
  buildTutorialEmbed,
  postPresentation,
  ensureCategory,
  createTutorialChannel,
  createAllTutorials,
  loadItems,
};
