'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { EmbedBuilder } = require('discord.js');
const { branding } = require('../config');

// Bannière enregistrée depuis Discord par /banniere (URL du CDN Discord).
const dataDir = path.join(__dirname, '..', '..', 'data');
const dataFile = path.join(dataDir, 'branding.json');
// Bannière fournie dans le dépôt, servie par le serveur du bot.
const assetFile = path.join(__dirname, '..', '..', 'assets', 'banner.png');

function readSavedBanner() {
  try {
    const parsed = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    return typeof parsed?.bannerUrl === 'string' ? parsed.bannerUrl : null;
  } catch {
    return null;
  }
}

/** Enregistre la bannière (URL Discord) pour les prochains messages. */
function saveBanner(url) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify({ bannerUrl: url }, null, 2), 'utf8');
}

function hasLocalBanner() {
  try {
    return fs.statSync(assetFile).isFile();
  } catch {
    return false;
  }
}

/**
 * URL publique de la bannière, dans cet ordre :
 *  1. la variable d'environnement BANNER_URL
 *  2. la bannière enregistrée avec /banniere (data/branding.json)
 *  3. branding.bannerUrl de config.js
 *  4. /banner.png servi par le serveur du bot, si assets/banner.png existe
 *  5. null : seul le cadre est ajouté
 */
function resolveBannerUrl() {
  if (process.env.BANNER_URL) return process.env.BANNER_URL;

  const saved = readSavedBanner();
  if (saved) return saved;

  if (branding.bannerUrl) return branding.bannerUrl;

  const publicUrl = process.env.RENDER_EXTERNAL_URL;
  if (publicUrl && hasLocalBanner()) return `${publicUrl.replace(/\/$/, '')}/banner.png`;

  return null;
}

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp)$/i;
const VIDEO_EXT = /\.(mp4|mov|webm|mkv|m4v)$/i;

function isImageFile(file) {
  if ((file.contentType ?? '').startsWith('image/')) return true;
  return IMAGE_EXT.test(file.name ?? '');
}

function isVideoFile(file) {
  if ((file.contentType ?? '').startsWith('video/')) return true;
  return VIDEO_EXT.test(file.name ?? '');
}

/** Le média d'un message : la première image, sinon la première vidéo. */
function pickMedia(message) {
  const attachments = [...message.attachments.values()];
  return (
    attachments.find((file) => isImageFile(file)) ??
    attachments.find((file) => isVideoFile(file)) ??
    null
  );
}

/** Un message contient-il une photo ou une vidéo ? */
function hasMedia(message) {
  return Boolean(pickMedia(message));
}

/**
 * Construit les embeds : la bannière au-dessus, puis le média encadré par la
 * couleur du serveur (c'est le cadre).
 */
function buildFramedEmbeds(message) {
  const media = pickMedia(message);
  const banner = resolveBannerUrl();
  const embeds = [];

  // 1. La bannière, pleine largeur, au-dessus du cadre.
  if (banner) {
    embeds.push(new EmbedBuilder().setColor(branding.frameColor).setImage(banner));
  }

  // 2. Le média, encadré.
  const frame = new EmbedBuilder()
    .setColor(branding.frameColor)
    .setAuthor({
      name: message.member?.displayName ?? message.author.username,
      iconURL: message.author.displayAvatarURL(),
    })
    .setFooter({ text: branding.footer })
    .setTimestamp(message.createdAt);

  const isImage = isImageFile(media);

  if (isImage) {
    frame.setImage(media.url);
  } else {
    // Une vidéo ne s'affiche pas dans une image d'embed : Discord montre déjà
    // le lecteur au-dessus, on ajoute le lien et le nom.
    frame.addFields({ name: '🎥 Video', value: `[${media.name}](${media.url})` });
  }

  if (message.content && message.content.trim().length > 0) {
    frame.setDescription(message.content.slice(0, 1500));
  }

  embeds.push(frame);
  return embeds;
}

module.exports = {
  hasMedia,
  pickMedia,
  buildFramedEmbeds,
  resolveBannerUrl,
  hasLocalBanner,
  saveBanner,
  readSavedBanner,
  isImageFile,
};
