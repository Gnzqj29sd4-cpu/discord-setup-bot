'use strict';

const { acceptsFlags, flagLanguages } = require('../lib/flags');

/** Ajoute les drapeaux sous chaque nouveau message. */
module.exports = {
  name: 'messageCreate',

  async execute(message) {
    if (message.author.bot || message.system) return;
    if (!message.guild) return;
    if (!message.content || message.content.trim().length === 0) return;
    if (!acceptsFlags(message.channel?.name)) return;

    for (const language of flagLanguages()) {
      try {
        await message.react(language.emoji);
      } catch (error) {
        // Permission manquante ou limite de débit : on s'arrête pour ce message.
        console.warn('[flags] reaction failed:', error.message);
        return;
      }
    }
  },
};
