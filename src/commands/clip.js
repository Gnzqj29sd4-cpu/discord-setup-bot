'use strict';

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');
const { clips } = require('../config');

/**
 * Nettoie un lien collé depuis une application mobile :
 * - ajoute https:// si le lien commence par "tiktok.com/…"
 * - retire les espaces et les balises < >
 * Renvoie null si ce n'est pas un lien valide.
 */
function normalizeUrl(value) {
  if (!value) return null;

  let url = String(value).trim().replace(/^<|>$/g, '');
  if (!url) return null;

  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('.')) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/** Détecte la plateforme à partir du nom de domaine. */
function detectPlatform(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    const platform = clips.platforms.find((entry) =>
      entry.match.some((domain) => host === domain || host.endsWith(`.${domain}`)),
    );
    return platform ?? clips.defaultPlatform;
  } catch {
    return clips.defaultPlatform;
  }
}

/**
 * Récupère la miniature d'un TikTok via l'API oEmbed publique.
 * Aucune clé, aucun compte. Renvoie null si indisponible.
 */
async function fetchTikTokThumbnail(url) {
  try {
    const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return null;

    const data = await response.json();
    return typeof data?.thumbnail_url === 'string' ? data.thumbnail_url : null;
  } catch {
    return null;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clip')
    .setDescription('Post a clip (TikTok, YouTube, Instagram, Twitch…)')
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName('lien')
        .setDescription('Video link (TikTok, YouTube, Instagram, Twitch…)')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('titre').setDescription('Clip title').setRequired(false).setMaxLength(256),
    )
    .addStringOption((option) =>
      option
        .setName('description')
        .setDescription('Short description')
        .setRequired(false)
        .setMaxLength(2000),
    )
    .addStringOption((option) =>
      option
        .setName('image')
        .setDescription('Thumbnail URL (optional: automatic for TikTok)')
        .setRequired(false),
    ),

  async execute(interaction) {
    const lien = normalizeUrl(interaction.options.getString('lien', true));
    const titre = interaction.options.getString('titre') ?? 'New clip';
    const description = interaction.options.getString('description') ?? '';
    const imageOption = interaction.options.getString('image');

    if (clips.channel && interaction.channel?.name !== clips.channel) {
      await interaction.reply({
        content: `❌ Use \`/clip\` in ${clips.channel}.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!lien) {
      await interaction.reply({
        content:
          '❌ Invalid link.\nPaste the full video link, for example:\n`https://vm.tiktok.com/ZMabc123/`',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // L'image est facultative : si elle est fausse, on l'ignore plutôt que
    // de refuser tout le clip.
    let image = normalizeUrl(imageOption);
    const platform = detectPlatform(lien);

    await interaction.deferReply();

    // Miniature automatique pour TikTok quand aucune image n'est fournie.
    if (!image && platform.name === 'TikTok') {
      image = await fetchTikTokThumbnail(lien);
    }

    const body = [
      description,
      description ? '' : null,
      `🔗 **${platform.emoji} ${platform.name} link:**\n${lien}`,
      '',
      '❤️ **Support our creators!**',
      'Like, comment and share the video!',
    ]
      .filter((line) => line !== null)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(clips.color)
      .setTitle(`🎬 ${titre}`)
      .setDescription(body)
      .setFooter({ text: clips.footer })
      .setTimestamp();

    if (image) embed.setImage(image);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(`WATCH ON ${platform.name.toUpperCase()}`)
        .setEmoji(platform.emoji)
        .setStyle(ButtonStyle.Link)
        .setURL(lien),
    );

    await interaction.editReply({ embeds: [embed], components: [row] });

    const message = await interaction.fetchReply();
    for (const emoji of clips.reactions) {
      try {
        await message.react(emoji);
      } catch (error) {
        console.warn('[clip] reaction failed:', error.message);
        break;
      }
    }
  },
};
