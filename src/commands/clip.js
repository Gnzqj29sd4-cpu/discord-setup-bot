'use strict';

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');
const { clips } = require('../config');

const URL_PATTERN = /^https?:\/\/\S+$/i;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clip')
    .setDescription('Publier un clip ou une vidéo')
    .setDMPermission(false)
    .addStringOption((option) =>
      option.setName('titre').setDescription('Titre du clip').setRequired(true).setMaxLength(256),
    )
    .addStringOption((option) =>
      option
        .setName('description')
        .setDescription('Description du clip')
        .setRequired(true)
        .setMaxLength(2000),
    )
    .addStringOption((option) =>
      option.setName('lien').setDescription('Lien de la vidéo').setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('image')
        .setDescription('URL de la bannière ou de la miniature')
        .setRequired(true),
    ),

  async execute(interaction) {
    const titre = interaction.options.getString('titre', true);
    const description = interaction.options.getString('description', true);
    const lien = interaction.options.getString('lien', true).trim();
    const image = interaction.options.getString('image', true).trim();

    // Salon autorisé, si défini dans config.js
    if (clips.channel && interaction.channel?.name !== clips.channel) {
      await interaction.reply({
        content: `❌ La commande \`/clip\` s'utilise dans ${clips.channel}.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!URL_PATTERN.test(lien) || !URL_PATTERN.test(image)) {
      await interaction.reply({
        content:
          '❌ Liens invalides.\nLe lien et l\'image doivent commencer par `http://` ou `https://`.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(clips.color)
      .setTitle(`🎬 ${titre}`)
      .setDescription(
        `${description}\n\n` +
          `🔗 **Lien de la vidéo :**\n${lien}\n\n` +
          '❤️ **Soutenez notre créateur !**\n' +
          'Likez, commentez et partagez la vidéo !',
      )
      .setImage(image)
      .setFooter({ text: clips.footer })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('REGARDER LE CLIP')
        .setEmoji('▶️')
        .setStyle(ButtonStyle.Link)
        .setURL(lien),
    );

    await interaction.reply({ embeds: [embed], components: [row] });

    // Réactions automatiques : sans elles, le clip reste publié.
    const message = await interaction.fetchReply();
    for (const emoji of clips.reactions) {
      try {
        await message.react(emoji);
      } catch (error) {
        console.warn('[clip] réaction impossible :', error.message);
        break;
      }
    }
  },
};
