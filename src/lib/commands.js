'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

const commandsDir = path.join(__dirname, '..', 'commands');

/** Charge la définition JSON de toutes les commandes (slash + menu contextuel). */
function loadCommandData() {
  return fs
    .readdirSync(commandsDir)
    .filter((file) => file.endsWith('.js'))
    .map((file) => {
      const command = require(path.join(commandsDir, file));
      if (!command.data) {
        throw new Error(`${file} : "data" manquant, la commande ne peut pas être enregistrée.`);
      }
      return command.data.toJSON();
    });
}

/**
 * Enregistre les commandes.
 *
 * Les commandes de serveur (« guild commands ») apparaissent immédiatement,
 * alors que les globales peuvent mettre jusqu'à une heure. On enregistre donc
 * sur chaque serveur où le bot est présent — sans dépendre de GUILD_ID — et on
 * vide la liste globale pour ne pas garder d'anciennes commandes.
 *
 * `guildIds` : liste de serveurs ; `guildId` reste accepté pour un seul serveur.
 */
async function registerCommands({ token, clientId, guildIds = [], guildId = null }) {
  const commands = loadCommandData();
  const rest = new REST({ version: '10' }).setToken(token);

  const targets = [...new Set([...(guildId ? [guildId] : []), ...guildIds])].filter(Boolean);

  if (targets.length === 0) {
    // Aucun serveur connu : on retombe sur les commandes globales.
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    return { count: commands.length, guilds: [] };
  }

  for (const target of targets) {
    await rest.put(Routes.applicationGuildCommands(clientId, target), { body: commands });
  }

  // Nettoie les éventuelles commandes globales d'une ancienne version.
  await rest.put(Routes.applicationCommands(clientId), { body: [] }).catch((error) => {
    console.warn('[commandes] nettoyage global impossible :', error.message);
  });

  return { count: commands.length, guilds: targets };
}

module.exports = { loadCommandData, registerCommands };
