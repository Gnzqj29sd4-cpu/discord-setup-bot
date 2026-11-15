'use strict';

// =============================================================================
//  SERVER CONFIGURATION
//  Everything the bot creates is described here. Edit, restart, then /salon.
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
  // Everyone can read and write
  public: {
    everyone: { allow: ['ViewChannel', 'ReadMessageHistory'], deny: [] },
    groups: {},
  },
  // Everyone can read, only staff can write (rules, announcements, information)
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
//  5. CHANNELS — all names in English
// -----------------------------------------------------------------------------
const categories = [
  {
    name: '📌・INFORMATION',
    access: 'public',
    channels: [
      { name: '📜・rules', type: 'text', access: 'readonly', topic: 'Server rules' },
      {
        name: '📢・announcements',
        type: 'text',
        access: 'readonly',
        topic: 'Official announcements',
      },
      {
        name: '📋・information',
        type: 'text',
        access: 'readonly',
        topic: 'Everything you need to know about this server',
      },
    ],
  },
  {
    name: '💬・COMMUNITY',
    access: 'public',
    channels: [
      { name: '💬・general', type: 'text', topic: 'Talk about anything, in English' },
      { name: '🎓・tutorials', type: 'text', topic: 'Video tutorials' },
    ],
  },
  {
    // One channel per platform: post the clip in the matching channel.
    name: '🎬・CLIPS',
    access: 'public',
    channels: [
      { name: '📱・tiktok', type: 'text', topic: 'TikTok clips — use /clip' },
      { name: '▶️・youtube', type: 'text', topic: 'YouTube clips — use /clip' },
      { name: '📸・instagram', type: 'text', topic: 'Instagram reels — use /clip' },
      { name: '🎮・twitch', type: 'text', topic: 'Twitch clips — use /clip' },
      { name: '🎬・other-clips', type: 'text', topic: 'Any other clip — use /clip' },
      {
        name: '🏆・best-clips',
        type: 'text',
        access: 'readonly',
        topic: 'The best clips of the week',
      },
    ],
  },
  {
    name: '🛡️・STAFF',
    access: 'staff',
    channels: [
      { name: '💼・staff', type: 'text' },
      { name: '🚨・logs', type: 'text' },
    ],
  },
  {
    name: '🔊・VOICE',
    access: 'public',
    channels: [{ name: '🔊・General', type: 'voice' }],
  },
];

// -----------------------------------------------------------------------------
//  6. RULES — published automatically by /salon in 📜・rules
// -----------------------------------------------------------------------------
const rules = {
  channel: '📜・rules',
  title: '📜 Server Rules',
  intro: 'By staying on this server, you agree to the rules below.',
  items: [
    'Respect all members and staff.',
    'No insults, harassment or discrimination.',
    'No spam or unnecessary mentions.',
    'No advertising without permission.',
    'No raids, scams or malicious links.',
    'Follow staff instructions.',
    'No abuse of bots or server features.',
    'Respect all Discord Terms of Service and Community Guidelines.',
  ],
  staffPolicy: {
    title: '⚠️ Staff Policy',
    items: [
      'Moderators must remain professional.',
      'No abuse of moderation permissions.',
      'All important moderation actions must be logged.',
      'Staff decisions must be respected.',
    ],
  },
  footer: 'CORTISOLSCRIPT • SERVER RULES',
};

// -----------------------------------------------------------------------------
//  7. INFORMATION — published automatically by /salon in 📋・information
// -----------------------------------------------------------------------------
const information = {
  channel: '📋・information',
  title: '📋 Information',
  description: 'Everything you need to know about this server.',
  fields: [
    { name: '💬 Language', value: 'All channels and messages are in English.' },
    { name: '🎬 Clips', value: 'Publish a clip with `/clip`.' },
    { name: '🌍 Translation', value: 'Translate any text with `/traduire`.' },
    { name: '🛡️ Support', value: 'Contact a staff member in 💼・staff if you need help.' },
  ],
  footer: 'CORTISOLSCRIPT • INFORMATION',
};

// -----------------------------------------------------------------------------
//  8. NEW MEMBERS
// -----------------------------------------------------------------------------
const autoRolesOnJoin = ['member'];
const boosterRole = 'booster';

const welcome = {
  channel: '💬・general',
  title: 'Welcome',
  message: 'Read 📜・rules and enjoy your stay. Everything here is in English.',
  color: theme.primary,
};

// -----------------------------------------------------------------------------
//  9. TRANSLATION (/traduire)
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
//  9b. FLAGS — translation by flag reaction
//  The bot reacts to every message with the flags below. Clicking a flag
//  translates that message into the flag's language, in a reply.
// -----------------------------------------------------------------------------
const flags = {
  enabled: true,
  color: 0xff7900,
  // Languages (codes from the list above) offered as flags under each message.
  languages: ['fr', 'en', 'ar'],
  // Channels where the bot never adds flags (exact names).
  exclude: ['📜・rules', '📢・announcements', '📋・information', '🚨・logs'],
  // Longest message translated (MyMemory caps around 500 characters).
  maxLength: 450,
  footer: 'Flag-Reaction Feature',
};

// -----------------------------------------------------------------------------
//  10. CLIPS (/clip)
// -----------------------------------------------------------------------------
const clips = {
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
    { match: ['x.com', 'twitter.com'], name: 'X', emoji: '🐦' },
  ],
  defaultPlatform: { name: 'video', emoji: '▶️' },
};

module.exports = {
  theme,
  roles,
  roleGroups,
  accessPresets,
  categories,
  rules,
  information,
  autoRolesOnJoin,
  boosterRole,
  welcome,
  languages,
  translation,
  flags,
  clips,
};
