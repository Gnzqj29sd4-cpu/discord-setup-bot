'use strict';

const {
  SlashCommandBuilder,
  MessageFlags,
  EmbedBuilder,
  ChannelType,
} = require('discord.js');
const { theme } = require('../config');
const { isModerator, isHttpsUrl } = require('../lib/moderation');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('annonce')
    .setDescription('Publish an orange and black announcement')
    .setDMPermission(false)
    .addStringOption((option) =>
      option.setName('titre').setDescription('Announcement title').setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('texte').setDescription('Announcement text').setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('image').setDescription('Optional HTTPS image URL'),
    )
    .addBooleanOption((option) =>
      option.setName('everyone').setDescription('Mention @everyone').setRequired(false),
    )
    .addChannelOption((option) =>
      option
        .setName('salon')
        .setDescription('Channel to post in (default: this channel)')
        .addChannelTypes(ChannelType.GuildText),
    ),

  async execute(interaction) {
    if (!isModerator(interaction)) {
      await interaction.reply({
        content: 'This command is for moderators only.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const titre = interaction.options.getString('titre', true);
    const texte = interaction.options.getString('texte', true);
    const image = interaction.options.getString('image');
    const everyone = interaction.options.getBoolean('everyone') ?? false;
    const channel = interaction.options.getChannel('salon') ?? interaction.channel;

    if (image && !isHttpsUrl(image)) {
      await interaction.reply({
        content: 'The image must be a valid HTTPS URL.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(theme.primary)
      .setAuthor({ name: 'CORTISOL' })
      .setTitle(titre)
      .setDescription(texte)
      .setFooter({ text: 'CORTISOLSCRIPT' })
      .setTimestamp();

    if (image) embed.setImage(image);

    await channel.send({
      content: everyone ? '@everyone' : undefined,
      embeds: [embed],
      allowedMentions: { parse: everyone ? ['everyone'] : [] },
    });

    await interaction.reply({
      content: `Announcement published in ${channel}.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
