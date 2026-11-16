'use strict';

/**
 * Plan B quand les commandes slash ne sortent pas (pas encore enregistrées,
 * client Discord qui garde son cache, GUILD_ID absent…) : les mêmes commandes
 * sont utilisables en texte, par exemple `!flash` ou `!clip lien:https://…`.
 */

/** Ordre de repli pour les commandes où l'on écrit les valeurs sans les nommer. */
const POSITIONAL_ORDER = {
  clip: { lien: 0, titre: 1, description: 2, image: 3 },
  traduire: { texte: 0, langue: 1 },
};

/** Découpe `lien:https://x titre:"mon clip"` en options nommées. */
function parseArgs(text) {
  const args = new Map();
  const positional = [];
  const pattern = /([a-zA-ZÀ-ÿ_]+):("([^"]*)"|\S+)|"([^"]*)"|(\S+)/g;

  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match[1]) {
      const value = match[3] !== undefined ? match[3] : match[2];
      args.set(match[1].toLowerCase(), value);
    } else if (match[4] !== undefined) {
      positional.push(match[4]);
    } else if (match[5] !== undefined) {
      positional.push(match[5]);
    }
  }

  return { args, positional };
}

function toBoolean(value) {
  if (value === undefined || value === null) return null;
  return ['true', '1', 'oui', 'yes', 'on', 'vrai'].includes(String(value).toLowerCase());
}

/**
 * Faux objet `interaction` construit à partir d'un message : les commandes
 * existantes fonctionnent sans être modifiées.
 */
function createAdapter(message, commandName) {
  const rest = message.content.slice(message.content.indexOf(commandName) + commandName.length);
  const { args, positional } = parseArgs(rest);
  const order = POSITIONAL_ORDER[commandName] ?? {};

  let deferred = false;
  let replied = false;
  let lastMessage = null;

  const options = {
    getString(name) {
      if (args.has(name)) return args.get(name);
      const index = order[name];
      return index === undefined ? null : (positional[index] ?? null);
    },
    getBoolean(name) {
      return toBoolean(args.get(name));
    },
    getInteger(name) {
      const value = args.get(name);
      return value === undefined ? null : Number.parseInt(value, 10);
    },
    getAttachment() {
      return message.attachments.first() ?? null;
    },
    getChannel() {
      return message.mentions.channels.first() ?? null;
    },
    getUser() {
      return message.mentions.users.first() ?? null;
    },
    getSubcommand() {
      return positional[0] ?? null;
    },
  };

  const clean = (payload) => {
    const copy = { ...payload };
    // `flags` (messages éphémères) n'existe pas pour un message normal.
    delete copy.flags;
    if (!copy.content && !copy.embeds && !copy.components) copy.content = '✅';
    return copy;
  };

  const send = async (payload) => {
    replied = true;
    lastMessage = await message.reply(clean(payload));
    return lastMessage;
  };

  return {
    guild: message.guild,
    user: message.author,
    member: message.member,
    channel: message.channel,
    client: message.client,
    commandName,
    options,
    isChatInputCommand: () => true,
    isContextMenuCommand: () => false,
    get deferred() {
      return deferred;
    },
    get replied() {
      return replied;
    },
    async deferReply() {
      deferred = true;
      // Accusé de réception pour les commandes longues (salon, clip).
      lastMessage = await message.reply({ content: '⏳' }).catch(() => null);
    },
    reply: send,
    async editReply(payload) {
      if (lastMessage) {
        lastMessage = await lastMessage.edit(clean(payload)).catch(() => lastMessage);
        return lastMessage;
      }
      return send(payload);
    },
    async followUp(payload) {
      return send(payload);
    },
    async fetchReply() {
      return lastMessage;
    },
  };
}

module.exports = { parseArgs, createAdapter };
