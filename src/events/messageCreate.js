'use strict';

const { translation, languages } = require('../config');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Pose les drapeaux sous les nouveaux messages pour traduire d'un clic. */
module.exports = {
  name: 'messageCreate',

  async execute(message) {
    if (!translation.enabled || !translation.flagsUnderMessages) return;
    if (message.author.bot || message.system) return;
    if (!message.guild) return;
    if (!message.content || message.content.trim().length === 0) return;
    if (message.content.length > translation.maxLength) return;

    const channelName = message.channel.name ?? '';
    if (translation.exclude.includes(channelName)) return;
    if (translation.channels.length > 0 && !translation.channels.includes(channelName)) return;

    for (const language of languages) {
      try {
        await message.react(language.emoji);
      } catch (error) {
        // Permission manquante ou limite de débit : on arrête les drapeaux
        // de ce message plutôt que d'insister.
        console.warn('[drapeaux] réaction impossible :', error.message);
        return;
      }
      // Petite pause pour ne pas déclencher la limite de débit de Discord.
      await sleep(250);
    }
  },
};
