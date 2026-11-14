'use strict';

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType,
} = require('discord.js');
const { panel, languages } = require('../config');

/** Trouve un salon texte du serveur par son nom. */
async function findTextChannel(guild, name) {
  const channels = await guild.channels.fetch();
  return (
    channels.find(
      (channel) => channel && channel.name === name && channel.type === ChannelType.GuildText,
    ) ?? null
  );
}

function languagePanel() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('panel:langues')
    .setPlaceholder('Choisis ta langue')
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      languages.map((language) => ({
        label: language.label,
        value: language.key,
        emoji: language.emoji,
      })),
    );

  const embed = new EmbedBuilder()
    .setTitle('🌍 Choisis ta langue')
    .setDescription(
      'Sélectionne ta langue dans le menu ci-dessous pour recevoir le rôle correspondant.\nChoisir une autre langue retire automatiquement la précédente.',
    )
    .setColor(0x5865f2);

  return { embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] };
}

function verificationPanel() {
  const button = new ButtonBuilder()
    .setCustomId('panel:verification')
    .setLabel('Je valide les règles')
    .setEmoji('✅')
    .setStyle(ButtonStyle.Success);

  const embed = new EmbedBuilder()
    .setTitle('✅ Vérification')
    .setDescription(
      'Clique sur le bouton ci-dessous pour accéder au serveur.\nEn validant, tu acceptes les règles du salon 📜・règles.',
    )
    .setColor(0x2ecc71);

  return { embeds: [embed], components: [new ActionRowBuilder().addComponents(button)] };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Envoie un panneau de rôles dans un salon')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((sub) =>
      sub
        .setName('langues')
        .setDescription('Envoie le menu de choix de langue')
        .addChannelOption((option) =>
          option
            .setName('salon')
            .setDescription('Salon où envoyer le panneau (par défaut le salon de config.js)')
            .addChannelTypes(ChannelType.GuildText),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('verification')
        .setDescription('Envoie le bouton de vérification')
        .addChannelOption((option) =>
          option
            .setName('salon')
            .setDescription('Salon où envoyer le panneau (par défaut le salon de config.js)')
            .addChannelTypes(ChannelType.GuildText),
        ),
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guild = interaction.guild;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const target =
      interaction.options.getChannel('salon') ??
      (await findTextChannel(
        guild,
        sub === 'langues' ? panel.languagesChannel : panel.verificationChannel,
      ));

    if (!target) {
      await interaction.editReply({
        content:
          'Salon introuvable : lance d\'abord `/setup salons`, ou précise le salon avec l\'option `salon`.',
      });
      return;
    }

    const payload = sub === 'langues' ? languagePanel() : verificationPanel();

    try {
      await target.send(payload);
    } catch (error) {
      await interaction.editReply({
        content: `Impossible d'envoyer le panneau dans ${target} : ${error.message}`,
      });
      return;
    }

    await interaction.editReply({ content: `Panneau envoyé dans ${target}.` });
  },
};
