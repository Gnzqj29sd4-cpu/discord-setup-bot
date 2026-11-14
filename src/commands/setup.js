'use strict';

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
} = require('discord.js');
const { createRoles, applyHierarchy } = require('../lib/roles');
const { createChannels, deleteConfiguredChannels } = require('../lib/channels');
const { createAllTutorials } = require('../lib/tutorials');

function formatList(items, max = 30) {
  if (items.length === 0) return 'aucun';
  if (items.length <= max) return items.map((item) => `\`${item}\``).join(', ');
  const shown = items.slice(0, max).map((item) => `\`${item}\``).join(', ');
  return `${shown} … et ${items.length - max} autre(s)`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Crée et configure le serveur (rôles, salons, panneaux)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addSubcommand((sub) =>
      sub.setName('tout').setDescription('Crée les rôles puis tous les salons manquants'),
    )
    .addSubcommand((sub) =>
      sub.setName('roles').setDescription('Crée les rôles manquants et remet la hiérarchie'),
    )
    .addSubcommand((sub) =>
      sub.setName('salons').setDescription('Crée les catégories et tous les salons manquants'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('tutos')
        .setDescription('Crée les salons tutoriels et poste leur présentation'),
    )
    .addSubcommand((sub) =>
      sub.setName('hierarchie').setDescription('Remet les rôles dans le bon ordre'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('reset')
        .setDescription('Supprime les salons créés par ce bot (destructif)')
        .addBooleanOption((option) =>
          option
            .setName('confirmer')
            .setDescription('Mets true pour confirmer la suppression')
            .setRequired(true),
        ),
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guild = interaction.guild;

    if (sub === 'reset' && interaction.options.getBoolean('confirmer') !== true) {
      await interaction.reply({
        content:
          'Rien n\'a été supprimé. Relance avec `confirmer: true` si tu veux vraiment supprimer les salons listés dans `config.js`.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const lines = [];
    let ok = true;

    try {
      if (sub === 'reset') {
        const deleted = await deleteConfiguredChannels(guild, (line) => lines.push(line));
        const embed = new EmbedBuilder()
          .setTitle('Reset terminé')
          .setColor(deleted.length ? 0xe74c3c : 0x95a5a6)
          .setDescription(
            deleted.length
              ? `${deleted.length} élément(s) supprimé(s).`
              : 'Aucun salon de `config.js` trouvé : rien à supprimer.',
          );
        if (deleted.length) {
          embed.addFields({ name: 'Supprimés', value: formatList(deleted, 40) });
        }
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      if (sub === 'roles' || sub === 'tout') {
        const { created, skipped } = await createRoles(guild, (line) => lines.push(line));
        lines.push(
          `Rôles : ${created.length} créé(s), ${skipped.length} déjà présent(s).`,
        );
      }

      if (sub === 'salons' || sub === 'tout') {
        const { created, skipped, missingRoles } = await createChannels(guild, (line) =>
          lines.push(line),
        );
        lines.push(
          `Salons : ${created.length} créé(s), ${skipped.length} déjà présent(s).`,
        );
        if (missingRoles.length > 0) {
          lines.push(
            `⚠️ Rôles absents au moment de la création (permissions incomplètes) : ${formatList(missingRoles, 10)} — lance \`/setup roles\` puis \`/setup salons\` de nouveau, ou \`/setup tout\`.`,
          );
        }
      }

      if (sub === 'tutos' || sub === 'tout') {
        const { created, skipped } = await createAllTutorials(guild, (line) => lines.push(line));
        lines.push(
          `Tutoriels : ${created.length} salon(s) créé(s), ${skipped.length} déjà présent(s).`,
        );
      }

      if (sub === 'hierarchie' || sub === 'tout' || sub === 'roles') {
        const applied = await applyHierarchy(guild);
        lines.push(
          applied
            ? 'Hiérarchie des rôles remise dans l\'ordre de `config.js`.'
            : 'Hiérarchie non modifiée : le bot doit avoir un rôle **au-dessus** de ceux qu\'il réordonne (sinon Discord refuse).',
        );
      }
    } catch (error) {
      ok = false;
      lines.push(`❌ Erreur : ${error.message}`);
      if (error.code === 50013) {
        lines.push(
          'Le bot manque de permissions : donne-lui **Gérer les salons** et **Gérer les rôles**, et place son rôle tout en haut de la hiérarchie.',
        );
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(ok ? 'Configuration terminée' : 'Configuration interrompue')
      .setColor(ok ? 0x2ecc71 : 0xe74c3c)
      .setDescription(lines.slice(-15).join('\n') || 'Rien à faire.')
      .setFooter({ text: 'Les éléments existants ne sont jamais modifiés ni supprimés.' });

    await interaction.editReply({ embeds: [embed] });
  },
};
