'use strict';

const { EmbedBuilder } = require('discord.js');
const { flags } = require('../config');
const { languageForEmoji } = require('../lib/flags');
const { translate } = require('../lib/translate');

// Anti-doublon : si plusieurs personnes cliquent le même drapeau au même moment,
// une seule traduction est envoyée. Le verrou expire au bout d'une minute, donc
// on peut retenter (retirer la réaction puis recliquer) sans être bloqué.
const recent = new Map();
const RECENT_MS = 60 * 1000;

function isDuplicate(key) {
  const at = recent.get(key);
  const now = Date.now();
  if (at && now - at < RECENT_MS) return true;
  recent.set(key, now);

  if (recent.size > 500) {
    for (const [storedKey, storedAt] of recent) {
      if (now - storedAt > RECENT_MS) recent.delete(storedKey);
    }
  }
  return false;
}

/** Un clic sur un drapeau traduit le message dans la langue du drapeau. */
module.exports = {
  name: 'messageReactionAdd',

  async execute(reaction, user) {
    if (!flags.enabled || user.bot) return;

    try {
      if (reaction.partial) await reaction.fetch();
    } catch (error) {
      console.warn('[flags] reaction unavailable:', error.message);
      return;
    }

    const language = languageForEmoji(reaction.emoji.name);
    if (!language) return;

    const message = reaction.message;
    if (message.partial) {
      try {
        await message.fetch();
      } catch (error) {
        console.warn('[flags] message unavailable:', error.message);
        return;
      }
    }

    if (!message.guild || !message.content) return;
    if (message.author.bot) return;

    const key = `${message.id}:${language.code}`;
    if (isDuplicate(key)) return;

    try {
      const result = await translate(message.content, language.code, flags.maxLength);

      const seconds = flags.deleteAfterSeconds;
      const embed = new EmbedBuilder()
        .setColor(flags.color)
        .setAuthor({
          name: message.author.username,
          iconURL: message.author.displayAvatarURL(),
        })
        .setDescription(
          `**From detected language → ${language.label} (${language.code.toUpperCase()})**\n\n` +
            `> ${result.text.slice(0, 4000)}`,
        )
        .setFooter({
          text:
            `${flags.footer} • requested by ${user.username}` +
            (seconds > 0 ? ` • deletes in ${seconds}s` : ''),
          iconURL: user.displayAvatarURL(),
        })
        .setTimestamp();

      const reply = await message.reply({
        embeds: [embed],
        allowedMentions: { repliedUser: false },
      });

      // Le message du bot disparaît tout seul, pour ne pas encombrer le salon.
      if (seconds > 0) {
        setTimeout(() => {
          reply.delete().catch((error) => {
            console.warn('[flags] delete failed:', error.message);
          });
          // Déverrouille : on peut recliquer le même drapeau tout de suite.
          recent.delete(key);
        }, seconds * 1000);
      }
    } catch (error) {
      console.warn('[flags] translation failed:', error.message);
      recent.delete(key);
    }
  },
};
