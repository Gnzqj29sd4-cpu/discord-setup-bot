'use strict';

const { EmbedBuilder } = require('discord.js');
const { autoRolesOnJoin, welcome } = require('../config');
const { addRole } = require('../lib/roles');

module.exports = {
  name: 'guildMemberAdd',

  async execute(member) {
    for (const key of autoRolesOnJoin) {
      try {
        await addRole(member, key);
      } catch (error) {
        console.warn(`[arrivée] rôle "${key}" non attribué :`, error.message);
      }
    }

    if (!welcome || !welcome.channel) return;

    const channel = member.guild.channels.cache.find(
      (candidate) => candidate.name === welcome.channel && candidate.isTextBased(),
    );
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(welcome.color ?? 0x2ecc71)
      .setTitle(`Bienvenue ${member.user.username} !`)
      .setDescription(
        `Salut ${member}, tu es le membre **#${member.guild.memberCount}**.\n` +
          'Choisis ta langue dans 🌍・choisir-sa-langue, puis valide les règles dans ✅・vérification.',
      )
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }));

    try {
      await channel.send({ content: `${member}`, embeds: [embed] });
    } catch (error) {
      console.warn('[arrivée] message de bienvenue non envoyé :', error.message);
    }
  },
};
