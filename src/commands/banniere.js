'use strict';

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
} = require('discord.js');
const { branding } = require('../config');
const { saveBanner, resolveBannerUrl, isImageFile } = require('../lib/branding');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banniere')
    .setDescription('Set the banner shown above every photo and video')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addAttachmentOption((option) =>
      option
        .setName('image')
        .setDescription('Your banner image (PNG, JPG, GIF)')
        .setRequired(true),
    ),

  async execute(interaction) {
    const attachment = interaction.options.getAttachment('image', true);

    if (!isImageFile(attachment)) {
      await interaction.reply({
        content: '❌ This file is not an image. Send a PNG, JPG, GIF or WebP.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // L'URL du CDN Discord est permanente : inutile d'héberger l'image ailleurs.
    saveBanner(attachment.url);

    const embed = new EmbedBuilder()
      .setColor(branding.frameColor)
      .setTitle('Banner saved')
      .setDescription(
        'Every photo or video posted from now on will get this banner above it, with a frame.\n\n' +
          '**To keep it after a redeploy**, add this variable where the bot runs ' +
          '(Render > Environment, or a GitHub secret):\n' +
          `\`BANNER_URL\` = \`${attachment.url}\``,
      )
      .setImage(attachment.url);

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    console.log('[branding] banner set to', resolveBannerUrl());
  },
};
