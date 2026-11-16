'use strict';

// =============================================================================
//  SERVER CONFIGURATION — CLIPS ONLY
//  The server contains clip channels and nothing else. Edit, restart, /salon.
//  Existing channels, roles and messages are never overwritten or duplicated.
// =============================================================================

// -----------------------------------------------------------------------------
//  1. THEME — orange and black
// -----------------------------------------------------------------------------
const theme = {
  primary: 0xff5900, // orange
  dark: 0x141414, // near black
  success: 0x2ecc71,
};

// -----------------------------------------------------------------------------
//  2. ROLES (order = hierarchy, first is the highest)
// -----------------------------------------------------------------------------
const roles = [
  { key: 'owner', name: 'OWNER', color: 0xe74c3c, hoist: true, permissions: ['Administrator'] },
  { key: 'admin', name: 'ADMIN', color: 0x3498db, hoist: true, permissions: ['Administrator'] },
  {
    key: 'moderator',
    name: 'MODERATOR',
    color: 0xff5900,
    hoist: true,
    permissions: ['ViewAuditLog', 'KickMembers', 'ModerateMembers', 'ManageMessages'],
  },
  {
    key: 'manager',
    name: 'Manager',
    color: 0x2c3e50,
    hoist: true,
    permissions: ['ViewAuditLog', 'ManageMessages', 'ManageNicknames'],
  },
  {
    key: 'content_manager',
    name: 'CONTENT MANAGER',
    color: 0x9b59b6,
    hoist: true,
    permissions: ['ManageMessages', 'ManageThreads'],
  },
  {
    key: 'support_lvl3',
    name: 'SUPPORT-LVL3',
    color: 0x2ecc71,
    hoist: true,
    mentionable: true,
    permissions: ['ManageMessages'],
  },
  { key: 'support_lvl2', name: 'SUPPORT-LVL2', color: 0x27ae60, hoist: true, mentionable: true },
  { key: 'support_lvl1', name: 'SUPPORT-LVL1', color: 0x1e8449, hoist: true, mentionable: true },
  { key: 'test_supporter', name: 'TEST-SUPPORTER', color: 0x16a085, hoist: true, mentionable: true },
  { key: 'supporter', name: 'SUPPORTER', color: 0x145a32, hoist: true, mentionable: true },
  {
    key: 'security',
    name: 'Security',
    color: 0x95a5a6,
    hoist: true,
    permissions: ['ViewAuditLog', 'ModerateMembers'],
  },
  { key: 'streamer', name: 'STREAMER', color: 0xe91e63, hoist: true, mentionable: true },
  { key: 'creator_lvl3', name: 'CREATOR LVL 3', color: 0x00e0c6, hoist: true, mentionable: true },
  { key: 'creator_lvl2', name: 'CREATOR LVL 2', color: 0x00b8a9, hoist: true, mentionable: true },
  { key: 'creator_lvl1', name: 'CREATOR LVL 1', color: 0x008b8b, hoist: true, mentionable: true },
  { key: 'test_creator', name: 'TEST CREATOR', color: 0x5d6d7e, hoist: true, mentionable: true },
  { key: 'cc', name: 'CC', color: 0x7d3cff },
  { key: 'og_customer', name: 'OG CUSTOMER', color: 0xf1c40f, hoist: true, mentionable: true },
  { key: 'booster', name: 'Server Booster', color: 0xff5900, hoist: true },
  { key: 'member', name: 'member', color: 0x99aab5 },
];

// -----------------------------------------------------------------------------
//  3. ROLE GROUPS (who can see private channels)
// -----------------------------------------------------------------------------
const roleGroups = {
  staff: [
    'owner',
    'admin',
    'moderator',
    'manager',
    'content_manager',
    'support_lvl3',
    'support_lvl2',
    'support_lvl1',
    'test_supporter',
    'supporter',
    'security',
  ],
};

// -----------------------------------------------------------------------------
//  4. CHANNEL ACCESS LEVELS
// -----------------------------------------------------------------------------
const accessPresets = {
  // 100% accessibility: everyone can read, write, attach clips and react.
  // Everything is allowed explicitly, so a restrictive server-level permission
  // cannot lock the clip channels.
  public: {
    everyone: {
      allow: [
        'ViewChannel',
        'ReadMessageHistory',
        'SendMessages',
        'SendMessagesInThreads',
        'AttachFiles',
        'EmbedLinks',
        'AddReactions',
        'UseExternalEmojis',
      ],
      deny: [],
    },
    groups: {},
  },
  // Everyone can read, only staff can write
  readonly: {
    everyone: {
      allow: ['ViewChannel', 'ReadMessageHistory'],
      deny: ['SendMessages', 'SendMessagesInThreads', 'CreatePublicThreads', 'AddReactions'],
    },
    groups: {
      staff: { allow: ['ViewChannel', 'SendMessages', 'AddReactions'], deny: [] },
    },
  },
  // Staff only
  staff: {
    everyone: { allow: [], deny: ['ViewChannel'] },
    groups: {
      staff: { allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'], deny: [] },
    },
  },
};

// -----------------------------------------------------------------------------
//  5. CHANNELS — 10 numbered clip channels, open to everyone
//  Every channel is 'public': @everyone can read, write, attach and react.
// -----------------------------------------------------------------------------
const clipChannelCount = 10;

const categories = [
  {
    name: '🎬・CLIPS',
    access: 'public',
    channels: Array.from({ length: clipChannelCount }, (_, index) => ({
      name: `🎬・clip-${index + 1}`,
      type: 'text',
      access: 'public',
      topic: `Clip ${index + 1} — post your photo or video with /clip`,
    })),
  },
];

// -----------------------------------------------------------------------------
//  6. NEW MEMBERS
// -----------------------------------------------------------------------------
const autoRolesOnJoin = ['member'];
const boosterRole = 'booster';

// Welcome message: put a channel name here to enable it, '' to disable it.
const welcome = {
  channel: '',
  title: 'Welcome',
  message: 'Post your clips with /clip. Everything here is in English.',
  color: theme.primary,
};

// -----------------------------------------------------------------------------
//  7. TRANSLATION (/traduire)
// -----------------------------------------------------------------------------
const languages = [
  { label: 'Français', code: 'fr', emoji: '🇫🇷' },
  { label: 'English', code: 'en', emoji: '🇬🇧' },
  { label: 'Español', code: 'es', emoji: '🇪🇸' },
  { label: 'Português', code: 'pt', emoji: '🇵🇹' },
  { label: 'Deutsch', code: 'de', emoji: '🇩🇪' },
  { label: 'Русский', code: 'ru', emoji: '🇷🇺' },
  { label: 'Türkçe', code: 'tr', emoji: '🇹🇷' },
  { label: 'Italiano', code: 'it', emoji: '🇮🇹' },
  { label: 'العربية', code: 'ar', emoji: '🇸🇦' },
];

const translation = {
  defaultLanguage: 'fr',
  maxLength: 1800,
};

// -----------------------------------------------------------------------------
//  8. FLAGS — translation by flag reaction
//  The bot does NOT add flags under messages. You choose the language yourself:
//  open the emoji picker on a message, pick a flag, and the bot translates that
//  message into the flag's language, in a reply.
// -----------------------------------------------------------------------------
const flags = {
  enabled: true,
  color: 0xff7900,
  languages: ['fr', 'en', 'es', 'pt', 'de', 'ru', 'tr', 'it', 'ar'],
  maxLength: 450,
  // The bot's translation message deletes itself after this many seconds
  // (0 = keep it).
  deleteAfterSeconds: 15,
  footer: 'Flag-Reaction Feature',
};

// -----------------------------------------------------------------------------
//  9. CLIPS (/clip)
// -----------------------------------------------------------------------------const clips = {
  color: theme.primary,
  footer: 'CORTISOLSCRIPT • CONTENT CREATOR TEAM',
  reactions: ['❤️', '🔥'],
  // Empty = /clip works in every channel.
  channel: '',
  // Button label and emoji per platform, detected from the link.
  platforms: [
    { match: ['tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'], name: 'TikTok', emoji: '📱' },
    { match: ['youtube.com', 'youtu.be', 'm.youtube.com'], name: 'YouTube', emoji: '▶️' },
    { match: ['instagram.com', 'instagr.am'], name: 'Instagram', emoji: '📸' },
    { match: ['twitch.tv', 'clips.twitch.tv'], name: 'Twitch', emoji: '🎮' },
    { match: ['kick.com'], name: 'Kick', emoji: '🟣' },
    { match: ['facebook.com', 'fb.watch', 'fb.com'], name: 'Facebook', emoji: '📘' },
    { match: ['snapchat.com'], name: 'Snapchat', emoji: '👻' },
    { match: ['reddit.com', 'redd.it'], name: 'Reddit', emoji: '🟠' },
    { match: ['x.com', 'twitter.com'], name: 'X', emoji: '🐦' },
  ],
  defaultPlatform: { name: 'video', emoji: '▶️' },
};

// -----------------------------------------------------------------------------
//  10b. MODERATION & STAFF
//  Les identifiants viennent des variables d'environnement (.env / hébergeur).
// -----------------------------------------------------------------------------
const moderation = {
  // Rôle autorisé à lancer /annonce et /giveaway (en plus des administrateurs).
  roleId: process.env.MODERATOR_ROLE_ID ?? '',
};

// -----------------------------------------------------------------------------
//  10c. XP — 1 message = des points, avec un délai entre deux gains
// -----------------------------------------------------------------------------
const xp = {
  enabled: true,
  cooldownMs: 60 * 1000,
  min: 5,
  max: 15,
};

// -----------------------------------------------------------------------------
//  10d. RÔLES DE LANGUE AUTOMATIQUES
//  Le bot devine la langue du message et donne le rôle correspondant.
// -----------------------------------------------------------------------------
const languageRoles = {
  eng: process.env.ROLE_ENGLISH_ID ?? '',
  fra: process.env.ROLE_FRENCH_ID ?? '',
  ara: process.env.ROLE_ARABIC_ID ?? '',
};

// -----------------------------------------------------------------------------
//  11. BRANDING — banner above every photo/video
//  When someone posts an image or a video in a clip channel, the bot replies
//  with your banner on top and the media framed below it.
// -----------------------------------------------------------------------------
const branding = {
  enabled: true,
  // Only these channels (exact names). Empty = every channel.
  channels: [],
  // Border/author colour of the frame (orange).
  frameColor: theme.primary,
  footer: 'CORTISOLSCRIPT • CONTENT CREATOR TEAM',
  // Leave empty: the bot serves assets/banner.png itself, or use /banniere.
  // Otherwise put a direct image URL here (or in the BANNER_URL variable).
  bannerUrl: '',
};

module.exports = {
  theme,
  roles,
  roleGroups,
  accessPresets,
  categories,
  autoRolesOnJoin,
  boosterRole,
  welcome,
  languages,
  translation,
  flags,
  clips,
  moderation,
  xp,
  languageRoles,
  branding,
};
