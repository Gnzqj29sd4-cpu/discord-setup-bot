'use strict';

const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const { languages, translation } = require('../config');
const { translate, findLanguage } = require('../lib/translate');

const choices = languages.map((language) => ({
  name: `${language.emoji} ${language.label}`,
  value: language.code,
}));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('traduire')
    .setDescription('Traduit un texte dans la langue que tu choisis')
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName('texte')
        .setDescription('Le texte à traduire')
        .setRequired(true)
        .setMaxLength(1800),
    )
    .addStringOption((option) =>
      option
        .setName('langue')
        .setDescription('Langue dans laquelle traduire')
        .setRequired(true)
        .addChoices(...choices),
    ),

  async execute(interaction) {
    const texte = interaction.options.getString('texte', true);
    const target = findLanguage(interaction.options.getString('langue', true));

    if (!target) {
      await interaction.reply({ content: 'Langue inconnue.', flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply();

    try {
      const result = await translate(texte, target.code, translation.maxLength);

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setAuthor({ name: `${target.emoji} ${target.label}` })
        .setDescription(result.text.slice(0, 4000))
        .setFooter({ text: `Texte d'origine : ${texte.slice(0, 80)}` });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: `❌ Traduction impossible : ${error.message}` });
    }
  },
};
