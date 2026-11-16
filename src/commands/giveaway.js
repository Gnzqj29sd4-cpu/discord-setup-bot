'use strict';

const {
  SlashCommandBuilder,
  MessageFlags,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');
const { theme } = require('../config');
const { isModerator } = require('../lib/moderation');
const { saveGiveaway, getGiveaway, updateGiveaway, activeGiveaways } = require('../lib/store');

// Un minuteur par giveaway en cours, reprogrammé au redémarrage.
const timers = new Map();

function giveawayEmbed({ prize, winners, endsAt, participants }) {
  return new EmbedBuilder()
    .setColor(theme.primary)
    .setAuthor({ name: 'CORTISOL' })
    .setTitle('🎉 GIVEAWAY')
    .setDescription(
      `**Prize:** ${prize}\n` +
        `**Winners:** ${winners}\n` +
        `**Ends:** <t:${Math.floor(endsAt / 1000)}:R>\n` +
        `**Entries:** ${participants.length}\n\n` +
        'Click the button below to enter!',
    )
    .setFooter({ text: 'CORTISOLSCRIPT' })
    .setTimestamp();
}

function joinRow(messageId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`giveaway_join:${messageId}`)
      .setLabel('Enter')
      .setEmoji('🎉')
      .setStyle(ButtonStyle.Primary),
  );
}

/** Tire les gagnants et publie le résultat. */
async function finishGiveaway(client, messageId) {
  const giveaway = getGiveaway(messageId);
  if (!giveaway || giveaway.ended) return;

  updateGiveaway(messageId, { ended: true });
  timers.delete(messageId);

  const channel = await client.channels.fetch(giveaway.channelId).catch(() => null);
  if (!channel) return;

  const message = await channel.messages.fetch(messageId).catch(() => null);
  const pool = [...(giveaway.participants ?? [])];
  const winners = [];

  while (pool.length > 0 && winners.length < giveaway.winners) {
    winners.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }

  if (message) {
    const result = new EmbedBuilder()
      .setColor(theme.primary)
      .setAuthor({ name: 'CORTISOL' })
      .setTitle('🎉 GIVEAWAY ENDED')
      .setDescription(
        `**Prize:** ${giveaway.prize}\n` +
          `**Winner(s):** ${winners.length ? winners.map((id) => `<@${id}>`).join(', ') : 'No entries'}`,
      )
      .setFooter({ text: 'CORTISOLSCRIPT' })
      .setTimestamp();

    await message.edit({ embeds: [result], components: [] }).catch(() => {});
  }

  await channel
    .send(
      winners.length
        ? `Congratulations ${winners.map((id) => `<@${id}>`).join(', ')}! You won **${giveaway.prize}**.`
        : `The **${giveaway.prize}** giveaway ended with no entries.`,
    )
    .catch(() => {});
}

function schedule(client, messageId, endsAt) {
  const delay = Math.max(0, endsAt - Date.now());
  const timer = setTimeout(() => {
    finishGiveaway(client, messageId).catch((error) =>
      console.warn('[giveaway] finish failed:', error.message),
    );
  }, delay);
  timers.set(messageId, timer);
}

/** Reprogramme les giveaways encore ouverts (après un redémarrage). */
function resumeGiveaways(client) {
  for (const giveaway of activeGiveaways()) {
    schedule(client, giveaway.messageId, giveaway.endsAt);
  }
}

/** Gère le clic sur le bouton « Enter ». */
async function handleJoin(interaction) {
  const messageId = interaction.customId.split(':')[1];
  const giveaway = getGiveaway(messageId);

  if (!giveaway || giveaway.ended || Date.now() >= giveaway.endsAt) {
    await interaction.reply({
      content: 'This giveaway is over.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const participants = giveaway.participants ?? [];
  if (participants.includes(interaction.user.id)) {
    await interaction.reply({
      content: 'You already entered this giveaway!',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  participants.push(interaction.user.id);
  updateGiveaway(messageId, { participants });

  // Met à jour le compteur de participations sur le message.
  const message = interaction.message;
  if (message?.embeds?.[0]) {
    const updated = EmbedBuilder.from(message.embeds[0]).setDescription(
      message.embeds[0].description.replace(
        /\*\*Entries:\*\* \d+/,
        `**Entries:** ${participants.length}`,
      ),
    );
    await message.edit({ embeds: [updated] }).catch(() => {});
  }

  await interaction.reply({
    content: 'Your entry is registered. Good luck 🍀',
    flags: MessageFlags.Ephemeral,
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Start a giveaway')
    .setDMPermission(false)
    .addStringOption((option) =>
      option.setName('prix').setDescription('Prize').setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName('minutes')
        .setDescription('Duration in minutes')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10080),
    )
    .addIntegerOption((option) =>
      option
        .setName('gagnants')
        .setDescription('Number of winners')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(20),
    )
    .addChannelOption((option) =>
      option
        .setName('salon')
        .setDescription('Channel for the giveaway (default: this channel)')
        .addChannelTypes(ChannelType.GuildText),
    ),

  async execute(interaction, client) {
    if (!isModerator(interaction)) {
      await interaction.reply({
        content: 'This command is for moderators only.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const prize = interaction.options.getString('prix', true);
    const minutes = interaction.options.getInteger('minutes', true);
    const winners = interaction.options.getInteger('gagnants', true);
    const channel = interaction.options.getChannel('salon') ?? interaction.channel;
    const endsAt = Date.now() + minutes * 60 * 1000;

    const embed = giveawayEmbed({ prize, winners, endsAt, participants: [] });
    const sent = await channel.send({ embeds: [embed] });

    // Le bouton a besoin de l'identifiant du message : on le met à jour après.
    await sent.edit({ components: [joinRow(sent.id)] }).catch(() => {});

    saveGiveaway({
      messageId: sent.id,
      channelId: channel.id,
      guildId: interaction.guildId,
      prize,
      winners,
      endsAt,
      participants: [],
      ended: false,
    });

    schedule(client, sent.id, endsAt);

    await interaction.reply({
      content: `Giveaway started in ${channel}.`,
      flags: MessageFlags.Ephemeral,
    });
  },

  handleJoin,
  resumeGiveaways,
  finishGiveaway,
};
