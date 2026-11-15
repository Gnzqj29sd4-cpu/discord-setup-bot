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
        console.warn(`[join] role "${key}" not assigned:`, error.message);
      }
    }

    if (!welcome || !welcome.channel) return;

    const channel = member.guild.channels.cache.find(
      (candidate) => candidate.name === welcome.channel && candidate.isTextBased(),
    );
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(welcome.color)
      .setTitle(`${welcome.title} ${member.user.username}`)
      .setDescription(`You are member **#${member.guild.memberCount}**.\n\n${welcome.message}`)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }));

    try {
      await channel.send({ content: `${member}`, embeds: [embed] });
    } catch (error) {
      console.warn('[join] welcome message not sent:', error.message);
    }
  },
};
