'use strict';

const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  MessageFlags,
} = require('discord.js');
const { translation } = require('../config');
const { translate, buildTranslationEmbed, findLanguage } = require('../lib/translate');
const { getUserLanguage } = require('../lib/store');

/** Clic long sur un message > Applications > Traduire. */
module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('Traduire le message')
    .setType(ApplicationCommandType.Message)
    .setDMPermission(false),

  async execute(interaction) {
    const message = interaction.targetMessage;
    const code = getUserLanguage(interaction.user.id) ?? translation.defaultLanguage;
    const target = findLanguage(code);

    if (!message.content || message.content.trim().length === 0) {
      await interaction.reply({
        content: 'Ce message ne contient pas de texte à traduire (pièce jointe ou embed).',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();

    try {
      const result = await translate(message.content, target.code, translation.maxLength);
      await interaction.editReply({
        embeds: [
          buildTranslationEmbed({
            original: message.content,
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
