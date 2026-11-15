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
 * Enregistre les commandes sur Discord.
 * Avec `guildId`, elles apparaissent tout de suite ; sans, jusqu'à 1 h.
 * Quand on enregistre sur un serveur, les commandes globales sont vidées :
 * sinon d'anciennes commandes supprimées du code restent visibles.
 */
async function registerCommands({ token, clientId, guildId }) {
  const commands = loadCommandData();
  const rest = new REST({ version: '10' }).setToken(token);

  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    // Nettoie les éventuelles commandes globales d'une ancienne version.
    await rest.put(Routes.applicationCommands(clientId), { body: [] }).catch((error) => {
      console.warn('[commandes] nettoyage global impossible :', error.message);
    });
  } else {
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
  }

  return { count: commands.length, guildId: guildId ?? null };
}

module.exports = { loadCommandData, registerCommands };
