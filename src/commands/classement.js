'use strict';

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { theme } = require('../config');
const { topXp } = require('../lib/store');

const MEDALS = ['🥇', '🥈', '🥉'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('classement')
    .setDescription('Show the XP leaderboard')
    .setDMPermission(false),

  async execute(interaction) {
    const rows = topXp(interaction.guildId, 10);

    const description = rows.length
      ? rows
          .map((row, index) => {
            const medal = MEDALS[index] ?? `**${index + 1}.**`;
            return `${medal} <@${row.userId}> — **${row.points} XP**`;
          })
          .join('\n')
      : 'No XP recorded yet.';

    const embed = new EmbedBuilder()
      .setColor(theme.primary)
      .setAuthor({ name: 'CORTISOL' })
      .setTitle('🏆 XP LEADERBOARD')
      .setDescription(description)
      .setFooter({ text: 'CORTISOLSCRIPT' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
