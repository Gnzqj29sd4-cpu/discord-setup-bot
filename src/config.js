'use strict';

// =============================================================================
//  CONFIGURATION — simple et lisible
//  Rôles, salons, couleurs. Modifie ce fichier, relance le bot, puis /setup.
//  Ce qui existe déjà est ignoré : rien n'est écrasé, rien n'est supprimé.
// =============================================================================

// -----------------------------------------------------------------------------
//  1. RÔLES (dans l'ordre de la hiérarchie : le premier est le plus haut)
// -----------------------------------------------------------------------------
const roles = [
  { key: 'owner', name: 'OWNER', color: 0xe74c3c, hoist: true, permissions: ['Administrator'] },
  { key: 'admin', name: 'ADMIN', color: 0x3498db, hoist: true, permissions: ['Administrator'] },
  {
    key: 'moderator',
    name: 'MODERATOR',
    color: 0xf1c40f,
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
  { key: 'booster', name: 'Server Booster', color: 0xe67e22, hoist: true },
  { key: 'member', name: 'member', color: 0x99aab5 },
];

// -----------------------------------------------------------------------------
//  2. GROUPES DE RÔLES (qui voit quoi)
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
//  3. NIVEAUX D'ACCÈS DES SALONS
// -----------------------------------------------------------------------------
const accessPresets = {
  // Tout le monde voit et écrit
  public: {
    everyone: { allow: ['ViewChannel', 'ReadMessageHistory'], deny: [] },
    groups: {},
  },
  // Tout le monde voit, seul le staff écrit (règles, annonces)
  readonly: {
    everyone: {
      allow: ['ViewChannel', 'ReadMessageHistory'],
      deny: ['SendMessages', 'SendMessagesInThreads', 'CreatePublicThreads', 'AddReactions'],
    },
    groups: {
      staff: { allow: ['ViewChannel', 'SendMessages', 'AddReactions'], deny: [] },
    },
  },
  // Staff seulement
  staff: {
    everyone: { allow: [], deny: ['ViewChannel'] },
    groups: {
      staff: { allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'], deny: [] },
    },
  },
};

// -----------------------------------------------------------------------------
//  4. SALONS
//  type : 'text' ou 'voice'. access : 'public', 'readonly' ou 'staff'.
// -----------------------------------------------------------------------------
const categories = [
  {
    name: '📢・INFORMATION',
    access: 'public',
    channels: [
      { name: '📜・règles', type: 'text', access: 'readonly', topic: 'Les règles du serveur' },
      { name: '📢・annonces', type: 'text', access: 'readonly', topic: 'Les annonces officielles' },
    ],
  },
  {
    name: '💬・COMMUNAUTÉ',
    access: 'public',
    channels: [
      { name: '💬・général', type: 'text' },
      { name: '🎬・clips', type: 'text', topic: 'Les clips des créateurs' },
      { name: '🎓・tutoriels', type: 'text', topic: 'Les tutoriels en vidéo' },
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
    name: '🔊・VOCAL',
    access: 'public',
    channels: [{ name: '🔊・Général', type: 'voice' }],
  },
];

// -----------------------------------------------------------------------------
//  5. ARRIVÉE D'UN MEMBRE
//  Rôle donné automatiquement, et salon du message de bienvenue.
// -----------------------------------------------------------------------------
const autoRolesOnJoin = ['member'];
const boosterRole = 'booster';
const welcome = { channel: '💬・général', color: 0x2ecc71 };

// -----------------------------------------------------------------------------
//  6. TRADUCTION (/traduire)
//  C'est toi qui choisis la langue : /traduire texte:salut langue:English
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
  // Langue proposée par défaut dans le menu de /traduire
  defaultLanguage: 'fr',
  // Longueur maximale d'un texte à traduire
  maxLength: 1800,
};

// -----------------------------------------------------------------------------
//  7. CLIPS (/clip)
// -----------------------------------------------------------------------------
const clips = {
  color: 0xff5900,
  footer: 'CORTISOLSCRIPT • CONTENT CREATOR TEAM',
  reactions: ['❤️', '🔥'],
  // Salon où /clip est autorisé (nom exact). Vide = tous les salons.
  channel: '',
};

module.exports = {
  roles,
  roleGroups,
  accessPresets,
  categories,
  autoRolesOnJoin,
  boosterRole,
  welcome,
  languages,
  translation,
  clips,
};
