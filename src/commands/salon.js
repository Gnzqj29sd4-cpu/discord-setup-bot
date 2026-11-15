'use strict';

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
} = require('discord.js');
const { createRoles, applyHierarchy } = require('../lib/roles');
const { createChannels, deleteConfiguredChannels } = require('../lib/channels');
const { theme, categories } = require('../config');

/** Nombre total de salons (hors catégories) décrits dans config.js. */
const totalChannels = categories.reduce((sum, category) => sum + category.channels.length, 0);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('salon')
    .setDescription('Create the server roles and clip channels')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addBooleanOption((option) =>
      option
        .setName('installer')
        .setDescription(
          `Install all ${totalChannels} clip channels from scratch (deletes the configured ones first)`,
        )
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName('reset')
        .setDescription('Same as installer: delete the configured channels, then recreate them')
        .setRequired(false),
    ),

  async execute(interaction) {
    const guild = interaction.guild;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const install =
      interaction.options.getBoolean('installer') === true ||
      interaction.options.getBoolean('reset') === true;

    const lines = [];

    try {
      if (install) {
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

      if (channelsResult.created.length + channelsResult.skipped.length < totalChannels) {
        lines.push(
          `⚠️ Expected ${totalChannels} channels. Run \`/salon installer:true\` to start over.`,
        );
      }
    } catch (error) {
      lines.push(`❌ ${error.message}`);
      if (error.code === 50013) {
        lines.push('Give the bot the Manage Channels and Manage Roles permissions.');
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(install ? 'All channels installed' : 'Server setup complete')
      .setColor(theme.primary)
      .setDescription(lines.slice(-12).join('\n') || 'Nothing to do.');

    await interaction.editReply({ embeds: [embed] });
  },
};
