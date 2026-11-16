'use strict';

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { theme } = require('../config');
const { getXp } = require('../lib/store');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('xp')
    .setDescription('Show the XP of a member')
    .setDMPermission(false)
    .addUserOption((option) =>
      option.setName('membre').setDescription('Member to check (default: you)'),
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('membre') ?? interaction.user;
    const points = getXp(interaction.guildId, user.id);

    const embed = new EmbedBuilder()
      .setColor(theme.primary)
      .setAuthor({ name: 'CORTISOL' })
      .setTitle('🏆 XP')
      .setDescription(`${user} has **${points} XP**.`)
      .setFooter({ text: 'CORTISOLSCRIPT' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
