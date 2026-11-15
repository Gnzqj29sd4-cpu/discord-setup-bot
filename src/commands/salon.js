'use strict';

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
} = require('discord.js');
const { createRoles, applyHierarchy } = require('../lib/roles');
const { createChannels, deleteConfiguredChannels } = require('../lib/channels');
const { theme } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('salon')
    .setDescription('Create the server roles and clip channels')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addBooleanOption((option) =>
      option
        .setName('reset')
        .setDescription('Delete the configured channels first, then recreate them')
        .setRequired(false),
    ),

  async execute(interaction) {
    const guild = interaction.guild;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const lines = [];

    try {
      if (interaction.options.getBoolean('reset') === true) {
        const deleted = await deleteConfiguredChannels(guild, (line) => lines.push(line));
        lines.push(`Channels deleted: ${deleted.length}`);
      }

      const rolesResult = await createRoles(guild, (line) => lines.push(line));
      lines.push(
        `Roles: ${rolesResult.created.length} created, ${rolesResult.skipped.length} already there.`,
      );

      const hierarchy = await applyHierarchy(guild);
      lines.push(
        hierarchy
          ? 'Role hierarchy updated.'
          : 'Hierarchy unchanged (the bot role must be at the top).',
      );

      const channelsResult = await createChannels(guild, (line) => lines.push(line));
      lines.push(
        `Channels: ${channelsResult.created.length} created, ${channelsResult.skipped.length} already there.`,
      );
    } catch (error) {
      lines.push(`❌ ${error.message}`);
      if (error.code === 50013) {
        lines.push('Give the bot the Manage Channels and Manage Roles permissions.');
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('Server setup complete')
      .setColor(theme.primary)
      .setDescription(lines.slice(-12).join('\n') || 'Nothing to do.');

    await interaction.editReply({ embeds: [embed] });
  },
};
