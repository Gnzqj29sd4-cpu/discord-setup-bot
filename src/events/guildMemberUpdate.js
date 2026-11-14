'use strict';

const { boosterRole } = require('../config');
const { resolveRole } = require('../lib/roles');

/** Donne le rôle de booster quand quelqu'un boost, le retire quand le boost s'arrête. */
module.exports = {
  name: 'guildMemberUpdate',

  async execute(oldMember, newMember) {
    if (!boosterRole) return;

    const wasBoosting = Boolean(oldMember.premiumSince);
    const isBoosting = Boolean(newMember.premiumSince);
    if (wasBoosting === isBoosting) return;

    const role = await resolveRole(newMember.guild, boosterRole);
    if (!role) return;

    try {
      if (isBoosting) {
        await newMember.roles.add(role, 'Boost du serveur');
      } else {
        await newMember.roles.remove(role, 'Boost terminé');
      }
    } catch (error) {
      console.warn('[boost] rôle non mis à jour :', error.message);
    }
  },
};
