'use strict';

require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { registerCommands } = require('./lib/commands');

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error(
    'DISCORD_TOKEN manquant : copie .env.example en .env et colle le token du bot (portail développeur Discord).',
  );
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    // Obligatoire pour lire le texte des messages (drapeaux de traduction).
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.GuildMember,
    Partials.User,
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
  ],
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

// --- Petit serveur HTTP (facultatif) ------------------------------------------
// Certains hébergeurs gratuits (Render, Koyeb…) n'acceptent que des « services
// web », qui doivent écouter sur un port. Il ne sert qu'à répondre « OK ».
if (process.env.PORT) {
  const http = require('node:http');
  const server = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(
      client.isReady()
        ? `Bot connecté : ${client.user.tag} (${client.guilds.cache.size} serveur(s))`
        : 'Bot en cours de connexion…',
    );
  });

  server.listen(Number(process.env.PORT), () => {
    console.log(`[web] page de statut sur le port ${process.env.PORT}`);
  });
}

// Enregistre les commandes à chaque démarrage : plus besoin de `npm run deploy`
// quand le bot tourne sur un hébergeur. Échec non bloquant (le bot démarre quand même).
async function deployCommands() {
  const clientId = process.env.CLIENT_ID;
  if (!clientId) {
    console.warn(
      '[commandes] CLIENT_ID absent de .env : les commandes ne sont pas enregistrées automatiquement.',
    );
    return;
  }

  try {
    const { count, guildId } = await registerCommands({
      token,
      clientId,
      guildId: process.env.GUILD_ID,
    });
    console.log(
      guildId
        ? `[commandes] ${count} commande(s) enregistrée(s) sur le serveur ${guildId}.`
        : `[commandes] ${count} commande(s) enregistrée(s) globalement.`,
    );
  } catch (error) {
    console.warn('[commandes] enregistrement impossible :', error.message);
  }
}

client.once('ready', () => {
  deployCommands();
});

client.login(token).catch((error) => {
  console.error('Connexion impossible :', error.message);
  console.error(
    'Vérifie que le token dans .env est correct, que les options "SERVER MEMBERS INTENT" et "MESSAGE CONTENT INTENT" sont activées (Bot > Privileged Gateway Intents) et que le bot est invité sur le serveur.',
  );
  process.exit(1);
});
