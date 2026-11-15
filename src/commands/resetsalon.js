'use strict';

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
} = require('discord.js');
const { deleteConfiguredChannels } = require('../lib/channels');
const { theme } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetsalon')
    .setDescription('Delete the configured channels, then recreate them with /salon')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addBooleanOption((option) =>
      option
        .setName('confirmer')
        .setDescription('Type true to confirm the deletion')
        .setRequired(true),
    ),

  async execute(interaction) {
    if (interaction.options.getBoolean('confirmer', true) !== true) {
      await interaction.reply({
        content: 'Nothing deleted. Run `/resetsalon confirmer:true` to confirm.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const deleted = [];
    try {
      await deleteConfiguredChannels(interaction.guild, (line) => deleted.push(line));
    } catch (error) {
      await interaction.editReply({ content: `❌ ${error.message}` });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('Channels deleted')
      .setColor(theme.primary)
      .setDescription(
        deleted.length
          ? `${deleted.length} channel(s) deleted.\n\nNow run \`/salon\` to recreate everything.`
          : 'No configured channel found. Run `/salon` to create them.',
      );

    await interaction.editReply({ embeds: [embed] });
  },
};
