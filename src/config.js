'use strict';

// =============================================================================
//  CONFIGURATION DU SERVEUR
//  Tout ce que le bot crée est décrit ici. Modifie ce fichier, puis relance
//  /setup roles ou /setup salons : ce qui existe déjà est ignoré, rien n'est
//  écrasé et rien n'est supprimé (sauf /setup reset, qui ne touche qu'aux
//  salons listés plus bas).
// =============================================================================

// -----------------------------------------------------------------------------
//  1. RÔLES
//  L'ordre de la liste = l'ordre de la hiérarchie (le premier est le plus haut).
//  `key` est l'identifiant interne utilisé par les permissions et les panneaux.
//  Les rôles des bots (CortisolScript Bot, iTranslator, Wick, Invite Tracker…)
//  sont créés par leurs applications : ne pas les mettre ici.
// -----------------------------------------------------------------------------
const roles = [
  {
    key: 'owner',
    name: 'OWNER',
    color: 0xe74c3c,
    hoist: true,
    mentionable: false,
    permissions: ['Administrator'],
  },
  {
    key: 'admin',
    name: 'ADMIN',
    color: 0x3498db,
    hoist: true,
    mentionable: false,
    permissions: ['Administrator'],
  },
  {
    key: 'moderator',
    name: 'MODERATOR',
    color: 0xf1c40f,
    hoist: true,
    mentionable: false,
    permissions: [
      'ViewAuditLog',
      'KickMembers',
      'ModerateMembers',
      'ManageMessages',
      'MuteMembers',
      'DeafenMembers',
      'MoveMembers',
    ],
  },
  {
    key: 'manager',
    name: 'Manager',
    color: 0x2c3e50,
    hoist: true,
    mentionable: false,
    permissions: ['ViewAuditLog', 'ManageMessages', 'ManageNicknames', 'ManageThreads'],
  },
  {
    key: 'content_manager',
    name: 'CONTENT MANAGER',
    color: 0x9b59b6,
    hoist: true,
    mentionable: false,
    permissions: ['ManageMessages', 'ManageThreads', 'ManageEvents'],
  },
  {
    key: 'support_lvl3',
    name: 'SUPPORT-LVL3',
    color: 0x2ecc71,
    hoist: true,
    mentionable: true,
    permissions: ['ViewAuditLog', 'ManageMessages', 'ManageThreads'],
  },
  {
    key: 'support_lvl2',
    name: 'SUPPORT-LVL2',
    color: 0x27ae60,
    hoist: true,
    mentionable: true,
    permissions: ['ManageMessages', 'ManageThreads'],
  },
  {
    key: 'support_lvl1',
    name: 'SUPPORT-LVL1',
    color: 0x1e8449,
    hoist: true,
    mentionable: true,
    permissions: [],
  },
  {
    key: 'test_supporter',
    name: 'TEST-SUPPORTER',
    color: 0x16a085,
    hoist: true,
    mentionable: true,
    permissions: [],
  },
  {
    key: 'supporter',
    name: 'SUPPORTER',
    color: 0x145a32,
    hoist: true,
    mentionable: true,
    permissions: [],
  },
  {
    key: 'security',
    name: 'Security',
    color: 0x95a5a6,
    hoist: true,
    mentionable: false,
    permissions: ['ViewAuditLog', 'ModerateMembers'],
  },
  {
    key: 'streamer',
    name: 'STREAMER',
    color: 0xe91e63,
    hoist: true,
    mentionable: true,
    permissions: [],
  },
  {
    key: 'creator_lvl3',
    name: 'CREATOR LVL 3',
    color: 0x00e0c6,
    hoist: true,
    mentionable: true,
    permissions: [],
  },
  {
    key: 'creator_lvl2',
    name: 'CREATOR LVL 2',
    color: 0x00b8a9,
    hoist: true,
    mentionable: true,
    permissions: [],
  },
  {
    key: 'creator_lvl1',
    name: 'CREATOR LVL 1',
    color: 0x008b8b,
    hoist: true,
    mentionable: true,
    permissions: [],
  },
  {
    key: 'test_creator',
    name: 'TEST CREATOR',
    color: 0x5d6d7e,
    hoist: true,
    mentionable: true,
    permissions: [],
  },
  {
    key: 'cc',
    name: 'CC',
    color: 0x7d3cff,
    hoist: false,
    mentionable: false,
    permissions: [],
  },
  {
    key: 'og_customer',
    name: 'OG CUSTOMER',
    color: 0xf1c40f,
    hoist: true,
    mentionable: true,
    permissions: [],
  },
  {
    key: 'booster',
    name: 'Server Booster',
    color: 0xe67e22,
    hoist: true,
    mentionable: false,
    permissions: [],
  },
  {
    key: 'member',
    name: 'member',
    color: 0x99aab5,
    hoist: false,
    mentionable: false,
    permissions: [],
  },
  // Rôles de langue (attribués par le panneau /panel langues)
  { key: 'lang_english', name: 'ENGLISH', color: 0x99aab5, hoist: false, mentionable: true, permissions: [] },
  { key: 'lang_french', name: 'FRENCH', color: 0x99aab5, hoist: false, mentionable: true, permissions: [] },
  { key: 'lang_spanish', name: 'SPANISH', color: 0x99aab5, hoist: false, mentionable: true, permissions: [] },
  { key: 'lang_portuguese', name: 'PORTUGUESE', color: 0x99aab5, hoist: false, mentionable: true, permissions: [] },
  { key: 'lang_german', name: 'GERMAN', color: 0x99aab5, hoist: false, mentionable: true, permissions: [] },
  { key: 'lang_russian', name: 'RUSSIAN', color: 0x99aab5, hoist: false, mentionable: true, permissions: [] },
  { key: 'lang_turkish', name: 'TURKISH', color: 0x99aab5, hoist: false, mentionable: true, permissions: [] },
  { key: 'lang_italian', name: 'ITALIAN', color: 0x99aab5, hoist: false, mentionable: true, permissions: [] },
  { key: 'lang_arabic', name: 'ARABIC', color: 0x99aab5, hoist: false, mentionable: true, permissions: [] },
  // Rôle des membres pas encore vérifiés
  {
    key: 'unverified',
    name: 'Unverified',
    color: 0x747f8d,
    hoist: false,
    mentionable: false,
    permissions: [],
  },
];

// -----------------------------------------------------------------------------
//  2. GROUPES DE RÔLES (utilisés par les permissions des salons)
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
  support: [
    'owner',
    'admin',
    'moderator',
    'manager',
    'support_lvl3',
    'support_lvl2',
    'support_lvl1',
    'test_supporter',
    'supporter',
  ],
  creators: [
    'owner',
    'admin',
    'moderator',
    'manager',
    'content_manager',
    'streamer',
    'creator_lvl3',
    'creator_lvl2',
    'creator_lvl1',
    'test_creator',
  ],
};

// -----------------------------------------------------------------------------
//  3. NIVEAUX D'ACCÈS DES SALONS
//  everyone : permissions de @everyone. groups : permissions des groupes ci-dessus.
// -----------------------------------------------------------------------------
const accessPresets = {
  // Visible et utilisable par tout le monde
  public: {
    everyone: { allow: ['ViewChannel', 'ReadMessageHistory'], deny: [] },
    groups: {},
  },
  // Visible par tout le monde, seul le staff écrit (règles, annonces…)
  readonly: {
    everyone: {
      allow: ['ViewChannel', 'ReadMessageHistory'],
      deny: [
        'SendMessages',
        'SendMessagesInThreads',
        'CreatePublicThreads',
        'CreatePrivateThreads',
        'AddReactions',
      ],
    },
    groups: {
      staff: { allow: ['ViewChannel', 'SendMessages', 'AddReactions'], deny: [] },
    },
  },
  // Réservé au staff
  staff: {
    everyone: { allow: [], deny: ['ViewChannel'] },
    groups: {
      staff: { allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'], deny: [] },
    },
  },
  // Réservé au support
  support: {
    everyone: { allow: [], deny: ['ViewChannel'] },
    groups: {
      support: { allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'], deny: [] },
    },
  },
  // Réservé aux créateurs (+ staff)
  creators: {
    everyone: { allow: [], deny: ['ViewChannel'] },
    groups: {
      creators: {
        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'Connect', 'Speak'],
        deny: [],
      },
    },
  },
  // Réservé aux créateurs, seul le staff écrit (annonces créateurs)
  creators_readonly: {
    everyone: { allow: [], deny: ['ViewChannel'] },
    groups: {
      creators: { allow: ['ViewChannel', 'ReadMessageHistory'], deny: ['SendMessages'] },
      staff: { allow: ['ViewChannel', 'SendMessages'], deny: [] },
    },
  },
};

// -----------------------------------------------------------------------------
//  4. SALONS ET CATÉGORIES
//  type : 'text' | 'voice' | 'forum' | 'annonce' | 'stage'
//  access : un niveau d'accès ci-dessus (par défaut celui de la catégorie)
// -----------------------------------------------------------------------------
const categories = [
  {
    name: '📢・INFORMATION',
    access: 'public',
    channels: [
      { name: '👋・bienvenue', type: 'text', access: 'readonly', topic: 'Bienvenue sur le serveur !' },
      { name: '📜・règles', type: 'text', access: 'readonly', topic: 'Les règles du serveur' },
      { name: '📢・annonces', type: 'text', access: 'readonly', topic: 'Les annonces officielles' },
      { name: '🎉・giveaways', type: 'text', access: 'readonly' },
      { name: '🤝・partenaires', type: 'text', access: 'readonly' },
      { name: '🌍・choisir-sa-langue', type: 'text', access: 'readonly', topic: 'Choisis ta langue avec le menu ci-dessous' },
      { name: '✅・vérification', type: 'text', access: 'readonly', topic: 'Clique sur le bouton pour valider ton arrivée' },
    ],
  },
  {
    name: '💬・COMMUNAUTÉ',
    access: 'public',
    channels: [
      { name: '💬・général', type: 'text', slowmode: 3 },
      { name: '🌍・english-chat', type: 'text' },
      { name: '🖼️・médias', type: 'text' },
      { name: '💡・suggestions', type: 'text' },
      { name: '🤖・commandes-bot', type: 'text' },
    ],
  },
  {
    name: '🛒・BOUTIQUE',
    access: 'public',
    channels: [
      { name: '🛍️・boutique', type: 'text', access: 'readonly', topic: 'Nos scripts et nos offres' },
      { name: '⭐・avis', type: 'text', access: 'readonly', topic: 'Les avis des clients' },
      { name: '❓・faq', type: 'text', access: 'readonly' },
      { name: '📩・tickets', type: 'text', topic: 'Ouvre un ticket pour toute demande' },
    ],
  },
  {
    name: '🎬・CRÉATEURS',
    access: 'creators',
    channels: [
      { name: '📣・annonces-créateurs', type: 'text', access: 'creators_readonly' },
      { name: '💬・salon-créateurs', type: 'text' },
      { name: '📈・logs-créateurs', type: 'text', access: 'staff' },
    ],
  },
  {
    name: '🛡️・STAFF',
    access: 'staff',
    channels: [
      { name: '💼・staff-chat', type: 'text' },
      { name: '🚨・logs-modération', type: 'text' },
      { name: '🎫・logs-tickets', type: 'text' },
      { name: '🤝・logs-support', type: 'text' },
      { name: '📝・logs-messages', type: 'text' },
    ],
  },
  {
    name: '🔊・VOCAL',
    access: 'public',
    channels: [
      { name: '🔊・Général', type: 'voice' },
      { name: '🎮・Gaming', type: 'voice' },
      { name: '🎧・Support', type: 'voice' },
      { name: '🎤・Créateurs', type: 'voice', access: 'creators' },
    ],
  },
];

// -----------------------------------------------------------------------------
//  5. RÔLES AUTOMATIQUES
//  Attribué à l'arrivée sur le serveur (par clé de rôle ci-dessus).
// -----------------------------------------------------------------------------
const autoRolesOnJoin = ['unverified'];

// Rôle donné automatiquement quand quelqu'un boost le serveur, et retiré sinon.
const boosterRole = 'booster';

// -----------------------------------------------------------------------------
//  6. LANGUES
//  `code` = code ISO utilisé par le traducteur, `emoji` = le drapeau.
//  Utilisées par le menu de langue, les drapeaux de traduction et /traduire.
// -----------------------------------------------------------------------------
const languages = [
  { key: 'lang_french', label: 'Français', code: 'fr', emoji: '🇫🇷' },
  { key: 'lang_english', label: 'English', code: 'en', emoji: '🇬🇧' },
  { key: 'lang_spanish', label: 'Español', code: 'es', emoji: '🇪🇸' },
  { key: 'lang_portuguese', label: 'Português', code: 'pt', emoji: '🇵🇹' },
  { key: 'lang_german', label: 'Deutsch', code: 'de', emoji: '🇩🇪' },
  { key: 'lang_russian', label: 'Русский', code: 'ru', emoji: '🇷🇺' },
  { key: 'lang_turkish', label: 'Türkçe', code: 'tr', emoji: '🇹🇷' },
  { key: 'lang_italian', label: 'Italiano', code: 'it', emoji: '🇮🇹' },
  { key: 'lang_arabic', label: 'العربية', code: 'ar', emoji: '🇸🇦' },
];

// -----------------------------------------------------------------------------
//  7. TRADUCTION
//  Le bot pose un drapeau sous les messages ; un clic traduit le message dans
//  la langue du drapeau. Aucun salon n'est dédié : ça marche partout.
// -----------------------------------------------------------------------------
const translation = {
  enabled: true,

  // Drapeaux sous chaque message. `false` = seulement /traduire et le menu
  // contextuel (clic long sur un message > Applications > Traduire).
  flagsUnderMessages: true,

  // Salons où les drapeaux apparaissent. Vide = tous les salons texte.
  channels: [],

  // Salons où le bot ne pose jamais de drapeaux (par nom).
  exclude: ['📜・règles', '📢・annonces', '🚨・logs-modération', '📝・logs-messages'],

  // Langue cible par défaut : menu contextuel « Traduire » et /traduire.
  defaultLanguage: 'fr',

  // Longueur maximale d'un bloc envoyé au traducteur.
  maxLength: 1800,
};

// -----------------------------------------------------------------------------
//  8. SALONS TUTORIELS
//  Chaque entrée devient un salon avec sa présentation et sa vidéo.
//  `/setup tutos` crée ceux de cette liste ; `/tuto ajouter` en crée un seul.
// -----------------------------------------------------------------------------
const tutorials = {
  category: '🎥・TUTORIELS',
  access: 'readonly',
  emoji: '🎬',
  // Remplis `video` avec un lien YouTube (ou autre) : Discord affichera
  // l'aperçu du lecteur dans le salon. `image` = miniature (URL d'image).
  items: [
    {
      name: '📥・installation',
      title: 'Installation',
      video: null,
      image: null,
      description:
        'Comment installer le script pas à pas, de zéro.\n\n**Au programme :** téléchargement, décompression, installateur, vérification finale.',
      steps: ['Télécharger l\'archive', 'Décompresser', 'Lancer l\'installateur', 'Vérifier que tout fonctionne'],
    },
    {
      name: '⚙️・configuration',
      title: 'Configuration',
      video: null,
      image: null,
      description:
        'Tous les réglages de base : clés, options et fichiers de configuration.\n\n**Au programme :** où se trouve la config, quoi remplir, quoi laisser par défaut.',
      steps: ['Ouvrir le fichier de config', 'Renseigner les clés et options', 'Redémarrer le script'],
    },
    {
      name: '🚀・premiere-utilisation',
      title: 'Première utilisation',
      video: null,
      image: null,
      description:
        'Lancement et premiers pas, pour partir du bon pied dès la première session.',
      steps: ['Lancer le script', 'Créer son profil', 'Faire ses premiers réglages'],
    },
    {
      name: '⌨️・commandes',
      title: 'Toutes les commandes',
      video: null,
      image: null,
      description:
        'La liste complète des commandes et ce que chacune fait, avec des exemples.',
      steps: ['Commandes de base', 'Commandes avancées', 'Raccourcis utiles'],
    },
    {
      name: '🎨・personnalisation',
      title: 'Personnalisation',
      video: null,
      image: null,
      description:
        'Changer l\'apparence et le comportement du script : thème, messages, raccourcis.',
      steps: ['Changer le thème', 'Modifier les messages', 'Sauvegarder sa configuration'],
    },
    {
      name: '🔌・modules-et-plugins',
      title: 'Modules et plugins',
      video: null,
      image: null,
      description:
        'Ajouter des fonctionnalités avec les modules : lesquels choisir, comment les installer.',
      steps: ['Choisir un module', 'L\'installer', 'L\'activer', 'Vérifier qu\'il fonctionne'],
    },
    {
      name: '🔄・mise-a-jour',
      title: 'Mise à jour',
      video: null,
      image: null,
      description:
        'Comment mettre à jour le script sans perdre sa configuration ni ses données.',
      steps: ['Sauvegarder sa config', 'Télécharger la nouvelle version', 'Remplacer les fichiers', 'Relancer'],
    },
    {
      name: '🛠️・depannage',
      title: 'Dépannage',
      video: null,
      image: null,
      description:
        'Les erreurs les plus courantes et comment les régler soi-même, sans attendre le support.',
      steps: ['Lire le message d\'erreur', 'Vérifier les cas fréquents', 'Contacter le support si besoin'],
    },
    {
      name: '💾・sauvegarde',
      title: 'Sauvegarde et restauration',
      video: null,
      image: null,
      description:
        'Sauvegarder sa configuration et ses données, et les restaurer après une réinstallation.',
      steps: ['Repérer les fichiers à sauver', 'Faire la sauvegarde', 'Restaurer sur une nouvelle installation'],
    },
    {
      name: '❓・faq',
      title: 'FAQ',
      video: null,
      image: null,
      description:
        'Les questions qui reviennent le plus souvent, avec les réponses courtes.',
      steps: ['Questions sur l\'installation', 'Questions sur la configuration', 'Questions sur les paiements'],
    },
  ],
};

// -----------------------------------------------------------------------------
//  9. PANNEAUX DE RÔLES (/panel langues et /panel verification)
// -----------------------------------------------------------------------------
const panel = {
  // Salon par défaut du menu de langues, quand /panel langues est lancé sans option
  languagesChannel: '🌍・choisir-sa-langue',
  // Salon par défaut du bouton de vérification, quand /panel verification est lancé sans option
  verificationChannel: '✅・vérification',
  verification: {
    giveRole: 'member',
    removeRole: 'unverified',
  },
};

// -----------------------------------------------------------------------------
//  10. MESSAGE DE BIENVENUE
//  Envoyé dans ce salon (par son nom) à chaque arrivée. `null` pour désactiver.
// -----------------------------------------------------------------------------
const welcome = {
  channel: '👋・bienvenue',
  color: 0x2ecc71,
};

// -----------------------------------------------------------------------------
//  11. CLIPS (/clip)
//  Publie un clip avec sa miniature, un bouton « Regarder » et des réactions.
// -----------------------------------------------------------------------------
const clips = {
  color: 0xff5900,
  footer: 'CORTISOLSCRIPT • CONTENT CREATOR TEAM',
  // Réactions ajoutées automatiquement après publication
  reactions: ['❤️', '🔥'],
  // Salon où la commande est autorisée (nom exact). Vide = tous les salons.
  channel: '',
};

module.exports = {
  roles,
  roleGroups,
  accessPresets,
  categories,
  languages,
  translation,
  tutorials,
  autoRolesOnJoin,
  boosterRole,
  panel,
  welcome,
  clips,
};
