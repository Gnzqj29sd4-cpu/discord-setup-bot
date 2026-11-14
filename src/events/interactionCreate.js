'use strict';

const { MessageFlags, EmbedBuilder } = require('discord.js');
const { languages, panel } = require('../config');
const { resolveRole, addRole, removeRole } = require('../lib/roles');
const { setUserLanguage } = require('../lib/store');

/** Menu de choix de langue : retire les autres langues, ajoute celle choisie. */
async function handleLanguage(interaction) {
  const key = interaction.values[0];
  const chosen = languages.find((language) => language.key === key);

  if (!chosen) {
    await interaction.reply({ content: 'Langue inconnue.', flags: MessageFlags.Ephemeral });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const member = interaction.member;
  const removed = [];
  setUserLanguage(interaction.user.id, chosen.code);

  for (const language of languages) {
    if (language.key === key) continue;
    const role = await resolveRole(interaction.guild, language.key);
    if (!role || !member.roles.cache.has(role.id)) continue;
    try {
      await member.roles.remove(role, 'Changement de langue');
      removed.push(role.name);
    } catch (error) {
      console.warn('[langues] retrait impossible :', error.message);
    }
  }

  let added;
  try {
    added = await addRole(member, key);
  } catch (error) {
    await interaction.editReply({ content: `❌ ${error.message}` });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setDescription(
      `✅ Ton rôle de langue est maintenant **${added.name}**.${
        removed.length ? `\nRetiré : ${removed.join(', ')}.` : ''
      }`,
    );

  await interaction.editReply({ embeds: [embed] });
}

/** Bouton de vérification : donne le rôle de membre, retire Unverified. */
async function handleVerification(interaction) {
  const { giveRole, removeRole: removeKey } = panel.verification;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    if (giveRole) await addRole(interaction.member, giveRole);
    if (removeKey) await removeRole(interaction.member, removeKey);
  } catch (error) {
    await interaction.editReply({ content: `❌ ${error.message}` });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setDescription('✅ Vérification validée, bienvenue sur le serveur !');

  await interaction.editReply({ embeds: [embed] });
}

module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction, client);
        return;
      }

      if (interaction.isStringSelectMenu() && interaction.customId === 'panel:langues') {
        await handleLanguage(interaction);
        return;
      }

      if (interaction.isButton() && interaction.customId === 'panel:verification') {
        await handleVerification(interaction);
      }
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
