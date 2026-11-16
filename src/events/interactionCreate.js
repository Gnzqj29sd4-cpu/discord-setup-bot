'use strict';

const { MessageFlags } = require('discord.js');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {
    // Bouton « Enter » des giveaways : géré par la commande elle-même.
    if (interaction.isButton() && interaction.customId.startsWith('giveaway_join:')) {
      const giveaway = client.commands.get('giveaway');
      if (giveaway?.handleJoin) {
        await giveaway.handleJoin(interaction).catch((error) => {
          console.error('[giveaway] join failed:', error);
        });
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error('[interaction]', error);
      const payload = {
        content: `❌ Erreur : ${error.message}`,
        flags: MessageFlags.Ephemeral,
      };
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(payload).catch(() => {});
      } else {
        await interaction.reply(payload).catch(() => {});
      }
    }
  },
};
