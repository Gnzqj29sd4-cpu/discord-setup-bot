'use strict';

const { ChannelType } = require('discord.js');
const { categories, roles: roleConfig, accessPresets, roleGroups } = require('../config');
const { buildOverwrites, sleep } = require('./permissions');

const REASON = 'Configuration automatique du serveur (/setup)';
const STEP_DELAY = 350;

const TYPES = {
  text: ChannelType.GuildText,
  voice: ChannelType.GuildVoice,
  forum: ChannelType.GuildForum,
  annonce: ChannelType.GuildAnnouncement,
  stage: ChannelType.GuildStageVoice,
};

function typeOf(name = 'text') {
  const type = TYPES[name];
  if (type === undefined) {
    throw new Error(`Type de salon inconnu dans config.js : "${name}"`);
  }
  return type;
}

/** Map clé de rôle → rôle du serveur (uniquement les rôles de config.js). */
async function buildRoleMap(guild) {
  const all = await guild.roles.fetch();
  const map = new Map();
  for (const def of roleConfig) {
    const role = all.find((candidate) => candidate.name === def.name);
    if (role) map.set(def.key, role);
  }
  return map;
}

/**
 * Crée les catégories et les salons manquants décrits dans config.js.
 * Rien n'est modifié ni supprimé : ce qui existe déjà est seulement ignoré.
 */
async function createChannels(guild, log = () => {}) {
  const existing = await guild.channels.fetch();
  const roleByKey = await buildRoleMap(guild);
  const missingRoles = roleConfig
    .filter((def) => !roleByKey.has(def.key))
    .map((def) => def.name);

  const created = [];
  const skipped = [];

  for (const catDef of categories) {
    const catAccess = catDef.access || 'public';

    let category = existing.find(
      (channel) => channel.type === ChannelType.GuildCategory && channel.name === catDef.name,
    );

    if (category) {
      skipped.push(`📁 ${category.name}`);
    } else {
      category = await guild.channels.create({
        name: catDef.name,
        type: ChannelType.GuildCategory,
        permissionOverwrites: buildOverwrites(guild, catAccess, roleByKey, accessPresets, roleGroups),
        reason: REASON,
      });
      created.push(`📁 ${category.name}`);
      log(`catégorie créée : ${category.name}`);
      await sleep(STEP_DELAY);
    }

    for (const chDef of catDef.channels || []) {
      const type = typeOf(chDef.type);
      const already = existing.find(
        (channel) => channel.parentId === category.id && channel.name === chDef.name,
      );

      if (already) {
        skipped.push(already.name);
        continue;
      }

      const options = {
        name: chDef.name,
        type,
        parent: category.id,
        permissionOverwrites: buildOverwrites(
          guild,
          chDef.access || catAccess,
          roleByKey,
          accessPresets,
          roleGroups,
        ),
        reason: REASON,
      };

      const isVoice = type === ChannelType.GuildVoice || type === ChannelType.GuildStageVoice;
      if (isVoice) {
        if (chDef.userLimit) options.userLimit = chDef.userLimit;
      } else {
        if (chDef.topic) options.topic = chDef.topic;
        if (chDef.slowmode) options.rateLimitPerUser = chDef.slowmode;
        if (chDef.nsfw) options.nsfw = chDef.nsfw;
      }

      const channel = await guild.channels.create(options);
      created.push(channel.name);
      log(`salon créé : ${channel.name}`);
      await sleep(STEP_DELAY);
    }
  }

  return { created, skipped, missingRoles };
}

/**
 * Supprime les salons des catégories décrites dans config.js : tous leurs
 * enfants (quel que soit leur nom, pour nettoyer aussi les anciens salons
 * renommés), puis la catégorie elle-même. Les autres catégories du serveur ne
 * sont jamais touchées.
 */
async function deleteConfiguredChannels(guild, log = () => {}) {
  const existing = await guild.channels.fetch();
  const deleted = [];

  for (const catDef of categories) {
    const category = existing.find(
      (channel) => channel.type === ChannelType.GuildCategory && channel.name === catDef.name,
    );

    const channelNames = new Set((catDef.channels || []).map((channel) => channel.name));

    for (const channel of existing.values()) {
      if (channel.type === ChannelType.GuildCategory) continue;

      const inCategory = category ? channel.parentId === category.id : false;
      // Dans la catégorie configurée : on supprime tout. Sinon : seulement les
      // salons dont le nom est explicitement dans config.js.
      const matches = inCategory || channelNames.has(channel.name);
      if (!matches) continue;

      await channel.delete('Reset via /salon installer').catch((error) => {
        log(`suppression impossible (${channel.name}) : ${error.message}`);
      });
      deleted.push(channel.name);
      log(`salon supprimé : ${channel.name}`);
      await sleep(250);
    }

    if (category) {
      await category.delete('Reset via /salon installer').catch(() => {});
      deleted.push(`📁 ${category.name}`);
      await sleep(250);
    }
  }

  return deleted;
}

module.exports = { createChannels, deleteConfiguredChannels, buildRoleMap, typeOf };
