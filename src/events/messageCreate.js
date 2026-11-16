'use strict';

const { hasMedia, buildFramedEmbeds } = require('../lib/branding');
const { createAdapter } = require('../lib/prefix');
const { branding, prefix } = require('../config');

/** Exécute une commande texte (`!flash`) avec la même logique que le slash. */
async function runPrefixCommand(message, client) {
  if (!prefix) return false;

  const content = message.content.trim();
  if (!content.startsWith(prefix)) return false;

  const [name] = content.slice(prefix.length).trim().split(/\s+/);
  if (!name) return false;

  const commandName = name.toLowerCase();

  // `!aide` / `!help` : la liste des commandes, sans dépendre de Discord.
  if (commandName === 'aide' || commandName === 'help') {
    const list = [...client.commands.values()]
      .map((command) => `\`${prefix}${command.data.name}\` — ${command.data.description}`)
      .join('\n');
    await message.reply({
      embeds: [{ color: 0xff5900, title: 'Commands', description: list || 'No command loaded.' }],
    });
    return true;
  }

  const command = client.commands.get(commandName);
  if (!command) return false;

  const fake = createAdapter(message, commandName);
  try {
    await command.execute(fake, client);
  } catch (error) {
    console.error('[prefix]', error);
    await message.reply({ content: `❌ ${error.message}` }).catch(() => {});
  }
  return true;
}

/**
 * 1. Commandes texte : `!flash`, `!clip lien:…`, `!salon`, `!aide`…
 * 2. Cadrage automatique des photos et vidéos.
 */
module.exports = {
  name: 'messageCreate',

  async execute(message, client) {
    if (message.author.bot || message.system) return;
    if (!message.guild) return;

    if (await runPrefixCommand(message, client)) return;

    if (!branding.enabled) return;
    if (branding.channels.length > 0 && !branding.channels.includes(message.channel?.name)) {
      return;
    }
    if (!hasMedia(message)) return;

    try {
      await message.reply({
        embeds: buildFramedEmbeds(message),
        allowedMentions: { repliedUser: false },
      });
    } catch (error) {
      console.warn('[branding] framed message not sent:', error.message);
    }
  },
};
