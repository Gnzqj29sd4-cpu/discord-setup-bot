'use strict';

require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { registerCommands } = require('./lib/commands');
const status = require('./lib/status');

// Le serveur de diagnostic démarre AVANT tout le reste : même si le bot ne peut
// pas se connecter, la page reste consultable pour savoir pourquoi.
status.start();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// Rapport des variables, visible sur la page de diagnostic (jamais le token).
status.setEnvReport({
  DISCORD_TOKEN: token ? `défini (${token.length} caractères)` : 'MANQUANT',
  CLIENT_ID: clientId || 'MANQUANT',
  GUILD_ID: guildId || 'vide (commandes globales, ~1 h d\'attente)',
  PORT: process.env.PORT || 'non défini',
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.GuildMember, Partials.User],
});

client.commands = new Collection();

// --- Chargement des commandes -------------------------------------------------
const commandsDir = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsDir).filter((name) => name.endsWith('.js'))) {
  const command = require(path.join(commandsDir, file));
  if (!command.data || !command.execute) {
    console.warn(`[commandes] ${file} ignoré : "data" ou "execute" manquant.`);
    continue;
  }
  client.commands.set(command.data.name, command);
}

// --- Chargement des événements ------------------------------------------------
const eventsDir = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsDir).filter((name) => name.endsWith('.js'))) {
  const event = require(path.join(eventsDir, file));
  if (!event.name || !event.execute) {
    console.warn(`[événements] ${file} ignoré : "name" ou "execute" manquant.`);
    continue;
  }
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

process.on('unhandledRejection', (error) => {
  console.error('[unhandledRejection]', error);
});

// Enregistre les commandes à chaque connexion : plus besoin de `npm run deploy`
// quand le bot tourne sur un hébergeur. Échec non bloquant.
async function deployCommands() {
  if (!clientId) {
    console.warn('[commandes] CLIENT_ID absent : commandes non enregistrées.');
    return;
  }

  try {
    const { count, guildId: registeredOn } = await registerCommands({
      token,
      clientId,
      guildId,
    });
    console.log(
      registeredOn
        ? `[commandes] ${count} commande(s) enregistrée(s) sur le serveur ${registeredOn}.`
        : `[commandes] ${count} commande(s) enregistrée(s) globalement.`,
    );
  } catch (error) {
    console.warn('[commandes] enregistrement impossible :', error.message);
  }
}

client.once('ready', () => {
  status.setBot(client);
  console.log(`[bot] connecté : ${client.user.tag} (${client.guilds.cache.size} serveur(s))`);
  deployCommands();
});

// --- Connexion avec nouvelles tentatives --------------------------------------
// Un token invalide, des intents désactivés ou un réseau capricieux ne doivent
// pas tuer le service : on réessaie toutes les minutes et la page de diagnostic
// explique la cause. Sur un hébergeur, un processus qui sort redémarre en boucle
// et ne sert jamais sa page — c'était le problème du premier déploiement.
let retryDelay = 60 * 1000;

function connect() {
  if (!token) {
    status.setError(
      new Error(
        'DISCORD_TOKEN manquant : ajoute-le dans les variables d\'environnement du service.',
      ),
    );
    return;
  }

  client.login(token).catch((error) => {
    status.setError(error);
    setTimeout(connect, retryDelay);
  });
}

client.on('disconnect', () => {
  console.warn('[bot] déconnecté de Discord, reconnexion automatique…');
});

client.on('error', (error) => {
  console.error('[bot] erreur :', error.message);
});

connect();
