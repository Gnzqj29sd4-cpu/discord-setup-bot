'use strict';

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
} = require('discord.js');
const { createTutorialChannel } = require('../lib/tutorials');

function splitSteps(value) {
  if (!value) return [];
  return value
    .split('|')
    .map((step) => step.trim())
    .filter(Boolean);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tuto')
    .setDescription('Gère les salons tutoriels')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((sub) =>
      sub
        .setName('ajouter')
        .setDescription('Crée un salon tutoriel avec sa présentation et sa vidéo')
        .addStringOption((option) =>
          option
            .setName('nom')
            .setDescription('Nom du salon (ex. 🎬・installation)')
            .setRequired(true)
            .setMaxLength(100),
        )
        .addStringOption((option) =>
          option.setName('titre').setDescription('Titre affiché dans la présentation').setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName('description')
            .setDescription('Présentation du tutoriel (ce qu\'on apprend)')
            .setRequired(true)
            .setMaxLength(1500),
        )
        .addStringOption((option) =>
          option.setName('video').setDescription('Lien de la vidéo (YouTube, Vimeo…)'),
        )
        .addStringOption((option) =>
          option.setName('image').setDescription('URL de la miniature'),
        )
        .addStringOption((option) =>
          option
            .setName('etapes')
            .setDescription('Étapes séparées par |  (ex. Installer | Configurer | Lancer)')
            .setMaxLength(600),
        ),
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub !== 'ajouter') return;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const item = {
      name: interaction.options.getString('nom', true),
      title: interaction.options.getString('titre', true),
      description: interaction.options.getString('description', true),
      video: interaction.options.getString('video'),
      image: interaction.options.getString('image'),
      steps: splitSteps(interaction.options.getString('etapes')),
    };

    try {
      const { channel, created } = await createTutorialChannel(interaction.guild, item, () => {});
      const embed = new EmbedBuilder()
        .setColor(created ? 0x2ecc71 : 0xf1c40f)
        .setDescription(
          created
            ? `✅ Salon ${channel} créé avec sa présentation.`
            : `ℹ️ Le salon ${channel} existe déjà : sa présentation n'a pas été modifiée.`,
        );
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: `❌ ${error.message}` });
    }
  },
};
