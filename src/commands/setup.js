'use strict';

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
} = require('discord.js');
const { createRoles, applyHierarchy } = require('../lib/roles');
const { createChannels, deleteConfiguredChannels } = require('../lib/channels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Crée les rôles et les salons du serveur')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addBooleanOption((option) =>
      option
        .setName('reset')
        .setDescription('Supprimer d\'abord les salons listés dans config.js')
        .setRequired(false),
    ),

  async execute(interaction) {
    const guild = interaction.guild;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const lines = [];

    try {
      if (interaction.options.getBoolean('reset') === true) {
        const deleted = await deleteConfiguredChannels(guild, (line) => lines.push(line));
        lines.push(`${deleted.length} salon(s) supprimé(s).`);
      }

      const rolesResult = await createRoles(guild, (line) => lines.push(line));
      lines.push(
        `Rôles : ${rolesResult.created.length} créé(s), ${rolesResult.skipped.length} déjà là.`,
      );

      const hierarchy = await applyHierarchy(guild);
      lines.push(
        hierarchy
          ? 'Hiérarchie des rôles remise dans l\'ordre.'
          : 'Hiérarchie non modifiée (le rôle du bot doit être tout en haut).',
      );

      const channelsResult = await createChannels(guild, (line) => lines.push(line));
      lines.push(
        `Salons : ${channelsResult.created.length} créé(s), ${channelsResult.skipped.length} déjà là.`,
      );
    } catch (error) {
      lines.push(`❌ ${error.message}`);
      if (error.code === 50013) {
        lines.push('Donne au bot les permissions Gérer les salons et Gérer les rôles.');
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('Configuration terminée')
      .setColor(0x2ecc71)
      .setDescription(lines.slice(-12).join('\n') || 'Rien à faire.');

    await interaction.editReply({ embeds: [embed] });
  },
};
