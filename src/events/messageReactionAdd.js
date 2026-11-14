'use strict';

const { translation } = require('../config');
const {
  findLanguageByEmoji,
  translateMessage,
  buildTranslationEmbed,
} = require('../lib/translate');

/** Un clic sur un drapeau traduit le message dans la langue du drapeau. */
module.exports = {
  name: 'messageReactionAdd',

  async execute(reaction, user) {
    if (!translation.enabled) return;
    if (user.bot) return;

    try {
      if (reaction.partial) await reaction.fetch();
      if (reaction.message.partial) await reaction.message.fetch();
    } catch (error) {
      console.warn('[drapeaux] message introuvable :', error.message);
      return;
    }

    const message = reaction.message;
    if (!message.guild || !message.content) return;
    if (message.author?.bot) return;

    const emoji = reaction.emoji.name ?? reaction.emoji.toString();
    const language = findLanguageByEmoji(emoji);
    if (!language) return;

    try {
      const result = await translateMessage(message, language.code, translation.maxLength);

      const embed = buildTranslationEmbed({
        original: message.content,
        translated: result.text,
        detected: result.detected,
        target: language.code,
      });

      await message.reply({
        embeds: [embed],
        allowedMentions: { repliedUser: false },
      });
    } catch (error) {
      console.warn('[drapeaux] traduction impossible :', error.message);
    }
  },
};
