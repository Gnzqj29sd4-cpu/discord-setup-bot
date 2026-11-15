'use strict';

const { EmbedBuilder } = require('discord.js');
const { rules, information, theme } = require('../config');

/**
 * Vérifie si le bot a déjà publié ce message dans le salon, pour ne jamais
 * créer de doublon quand /salon est relancé.
 */
async function alreadyPublished(channel, marker) {
  try {
    const messages = await channel.messages.fetch({ limit: 50 });
    return messages.some(
      (message) =>
        message.author.id === channel.client.user.id &&
        message.embeds.some((embed) => (embed.footer?.text ?? '').includes(marker)),
    );
  } catch (error) {
    console.warn('[publication] lecture impossible :', error.message);
    return false;
  }
}

function findChannel(guild, name) {
  return guild.channels.cache.find((channel) => channel.name === name && channel.isTextBased());
}

/** Embed des règles : orange pour les règles, noir pour la politique du staff. */
function buildRulesEmbeds() {
  const list = rules.items.map((item, index) => `**${index + 1}.** ${item}`).join('\n');

  const rulesEmbed = new EmbedBuilder()
    .setColor(theme.primary)
    .setTitle(rules.title)
    .setDescription(`${rules.intro}\n\n${list}`)
    .setFooter({ text: rules.footer });

  const staffList = rules.staffPolicy.items.map((item) => `• ${item}`).join('\n');

  const staffEmbed = new EmbedBuilder()
    .setColor(theme.dark)
    .setTitle(rules.staffPolicy.title)
    .setDescription(staffList)
    .setFooter({ text: rules.footer });

  return [rulesEmbed, staffEmbed];
}

/** Embed du salon d'information. */
function buildInformationEmbed() {
  return new EmbedBuilder()
    .setColor(theme.primary)
    .setTitle(information.title)
    .setDescription(information.description)
    .addFields(information.fields)
    .setFooter({ text: information.footer });
}

/**
 * Publie les règles dans 📜・rules (une seule fois).
 * Renvoie 'created' | 'skipped' | 'missing'.
 */
async function publishRules(guild, log = () => {}) {
  const channel = findChannel(guild, rules.channel);
  if (!channel) {
    log(`règles : salon ${rules.channel} introuvable`);
    return 'missing';
  }

  if (await alreadyPublished(channel, rules.footer)) {
    log(`règles : déjà publiées dans ${channel.name}`);
    return 'skipped';
  }

  await channel.send({ embeds: buildRulesEmbeds() });
  log(`règles publiées dans ${channel.name}`);
  return 'created';
}

/** Publie l'information dans 📋・information (une seule fois). */
async function publishInformation(guild, log = () => {}) {
  const channel = findChannel(guild, information.channel);
  if (!channel) {
    log(`information : salon ${information.channel} introuvable`);
    return 'missing';
  }

  if (await alreadyPublished(channel, information.footer)) {
    log(`information : déjà publiée dans ${channel.name}`);
    return 'skipped';
  }

  await channel.send({ embeds: [buildInformationEmbed()] });
  log(`information publiée dans ${channel.name}`);
  return 'created';
}

module.exports = {
  buildRulesEmbeds,
  buildInformationEmbed,
  publishRules,
  publishInformation,
};
