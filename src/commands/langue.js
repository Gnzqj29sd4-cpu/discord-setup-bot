'use strict';

const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const { languages } = require('../config');
const { findLanguage } = require('../lib/translate');
const { setUserLanguage, getUserLanguage } = require('../lib/store');
const { addRole, resolveRole } = require('../lib/roles');

const choices = languages.map((language) => ({
  name: `${language.emoji} ${language.label}`,
  value: language.code,
}));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('langue')
    .setDescription('Choisis ta langue : rôle de langue et traduction par défaut')
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName('langue')
        .setDescription('Ta langue (vide = affiche la langue actuelle)')
        .addChoices(...choices),
    ),

  async execute(interaction) {
    const value = interaction.options.getString('langue');

    if (!value) {
      const current = findLanguage(getUserLanguage(interaction.user.id));
      await interaction.reply({
        content: current
          ? `Ta langue est ${current.emoji} **${current.label}**.`
          : 'Tu n\'as pas encore choisi de langue : `/langue langue:Français`.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const language = findLanguage(value);
    if (!language) {
      await interaction.reply({ content: 'Langue inconnue.', flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    setUserLanguage(interaction.user.id, language.code);

    // Retire les autres rôles de langue, puis ajoute celui choisi.
    const removed = [];
    for (const other of languages) {
      if (other.key === language.key) continue;
      const role = await resolveRole(interaction.guild, other.key);
      if (!role || !interaction.member.roles.cache.has(role.id)) continue;
      await interaction.member.roles.remove(role, 'Changement de langue').catch(() => {});
      removed.push(role.name);
    }

    let roleName = null;
    try {
      const role = await addRole(interaction.member, language.key);
      roleName = role?.name ?? null;
    } catch (error) {
      console.warn('[langue] rôle non attribué :', error.message);
    }

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setDescription(
        `✅ Langue enregistrée : ${language.emoji} **${language.label}**` +
          (roleName ? `\nRôle : \`${roleName}\`` : '\n*(rôle de langue pas encore créé : `/setup roles`)*') +
          (removed.length ? `\nRetiré : ${removed.join(', ')}` : ''),
      );

    await interaction.editReply({ embeds: [embed] });
  },
};
