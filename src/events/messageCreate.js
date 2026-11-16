'use strict';

const { hasMedia, buildFramedEmbeds } = require('../lib/branding');
const { branding } = require('../config');

/**
 * Quand quelqu'un poste une photo ou une vidéo dans un salon de clips, le bot
 * répond avec la bannière du serveur au-dessus et le média encadré.
 * Toutes les commandes sont en slash : aucun préfixe texte.
 */
module.exports = {
  name: 'messageCreate',

  async execute(message) {
    if (!branding.enabled) return;
    if (message.author.bot || message.system) return;
    if (!message.guild) return;

    if (branding.channels.length > 0 && !branding.channels.includes(message.channel?.name)) {
      return;
    }

    if (!hasMedia(message)) return;

    try {
      await message.reply({
        embeds: buildFramedEmbeds(message),
        allowedMentions: { repliedUser: false },
      });
    } catch (error) {
      console.warn('[branding] framed message not sent:', error.message);
    }
  },
};
