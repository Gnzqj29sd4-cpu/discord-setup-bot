'use strict';

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { languages, translation } = require('../config');
const { translate, buildTranslationEmbed, findLanguage } = require('../lib/translate');

const choices = languages.map((language) => ({
  name: `${language.emoji} ${language.label}`,
  value: language.code,
}));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('traduire')
    .setDescription('Traduit un texte dans la langue de ton choix')
    .setDMPermission(false)
    .addStringOption((option) =>
      option.setName('texte').setDescription('Le texte à traduire').setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('langue')
        .setDescription('Langue cible (par défaut : français)')
        .addChoices(...choices),
    ),

  async execute(interaction) {
    const original = interaction.options.getString('texte', true);
    const target = findLanguage(interaction.options.getString('langue') ?? translation.defaultLanguage);

    if (!target) {
      await interaction.reply({ content: 'Langue inconnue.', flags: MessageFlags.Ephemeral });
      return;
    }

    if (original.length > translation.maxLength) {
      await interaction.reply({
        content: `Texte trop long : ${translation.maxLength} caractères maximum.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();

    try {
      const result = await translate(original, target.code, translation.maxLength);
      await interaction.editReply({
        embeds: [
          buildTranslationEmbed({
            original,
            translated: result.text,
            detected: result.detected,
            target: target.code,
          }),
        ],
      });
    } catch (error) {
      await interaction.editReply({ content: `❌ Traduction impossible : ${error.message}` });
    }
  },
};
