'use strict';

const { PermissionFlagsBits } = require('discord.js');
const { moderation } = require('../config');

/** Administrateur, ou membre ayant le rôle modérateur défini dans .env. */
function isModerator(interaction) {
  if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return true;
  if (!moderation.roleId) return false;
  return interaction.member?.roles?.cache?.has(moderation.roleId) ?? false;
}

/** URL HTTPS valide ? */
function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

module.exports = { isModerator, isHttpsUrl };
