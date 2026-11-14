'use strict';

const { PermissionFlagsBits } = require('discord.js');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Transforme ['ManageMessages', 'KickMembers'] en bitfield de permissions. */
function bits(names = []) {
  let value = 0n;
  for (const name of names) {
    const flag = PermissionFlagsBits[name];
    if (flag === undefined) {
      throw new Error(`Permission inconnue dans config.js : "${name}"`);
    }
    value |= flag;
  }
  return value;
}

/**
 * Construit les permissionOverwrites d'un salon à partir d'un niveau d'accès
 * (`public`, `readonly`, `staff`, `support`, `creators`).
 */
function buildOverwrites(guild, accessKey, roleByKey, accessPresets, roleGroups) {
  const preset = accessPresets[accessKey];
  if (!preset) {
    throw new Error(`Niveau d'accès inconnu dans config.js : "${accessKey}"`);
  }

  const overwrites = [];

  if (preset.everyone) {
    overwrites.push({
      id: guild.roles.everyone.id,
      allow: bits(preset.everyone.allow),
      deny: bits(preset.everyone.deny),
    });
  }

  for (const [groupName, groupPerms] of Object.entries(preset.groups || {})) {
    const keys = roleGroups[groupName] || [];
    for (const key of keys) {
      const role = roleByKey.get(key);
      if (!role) continue;
      overwrites.push({
        id: role.id,
        allow: bits(groupPerms.allow),
        deny: bits(groupPerms.deny),
      });
    }
  }

  return overwrites;
}

module.exports = { bits, buildOverwrites, sleep };
