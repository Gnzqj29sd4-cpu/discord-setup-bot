'use strict';

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { branding } = require('../config');
const { resolveBannerUrl } = require('../lib/branding');

/** /flash : poste uniquement la bannière du serveur, sans aucun texte. */
module.exports = {
  data: new SlashCommandBuilder()
    .setName('flash')
    .setDescription('Post the server banner image, with no text')
    .setDMPermission(false),

  async execute(interaction) {
    const banner = resolveBannerUrl();

    if (!banner) {
      await interaction.reply({
        content: '❌ No banner set yet. Use `/banniere image:<your image>` first.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.reply({
      embeds: [{ color: branding.frameColor, image: { url: banner } }],
    });
  },
};
