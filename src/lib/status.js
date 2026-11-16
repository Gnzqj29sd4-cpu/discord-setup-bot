'use strict';

const http = require('node:http');

// Petit serveur HTTP de diagnostic : il démarre AVANT la connexion à Discord et
// reste en ligne même si le bot plante. Ouvre l'URL du service pour voir où ça
// bloque (token, intents, variables manquantes) au lieu de fouiller les logs.
// Il ne sert que si PORT est défini (Render, Koyeb… le font automatiquement).

const state = {
  startedAt: new Date(),
  bot: null,
  error: null,
  attempts: 0,
  env: {},
};

/** Transforme une erreur de connexion Discord en conseil lisible. */
function hintFor(message = '') {
  const text = String(message).toLowerCase();

  if (text.includes('invalid token') || text.includes('401') || text.includes('unauthorized')) {
    return (
      'Le DISCORD_TOKEN est faux ou a été révoqué. Portail Discord > Bot > Reset Token, ' +
      'copie le nouveau token, puis remplace la valeur du secret DISCORD_TOKEN ' +
      '(GitHub : Settings > Secrets and variables > Actions ; Render : Environment).'
    );
  }
  if (text.includes('disallowed intents') || text.includes('4014')) {
    return 'Portail Discord > Bot > Privileged Gateway Intents : active SERVER MEMBERS INTENT et MESSAGE CONTENT INTENT, puis Save Changes, et redémarre le service.';
  }
  if (text.includes('enotfound') || text.includes('econnrefused') || text.includes('etimedout')) {
    return 'Le service n\'arrive pas à joindre Discord : réseau bloqué ou panne passagère.';
  }
  return 'Vérifie DISCORD_TOKEN, CLIENT_ID et GUILD_ID dans les variables d\'environnement du service, puis relance-le.';
}

function setEnvReport(report) {
  state.env = report;
}

function setBot(client) {
  state.bot = {
    tag: client.user ? client.user.tag : null,
    guilds: client.guilds.cache.size,
    since: new Date(),
  };
  state.error = null;
}

function setError(error) {
  state.attempts += 1;
  state.error = {
    message: error && error.message ? error.message : String(error),
    hint: hintFor(error && error.message),
    at: new Date(),
    attempts: state.attempts,
  };
  console.error('[connexion]', state.error.message);
  console.error('[connexion]', state.error.hint);
}

function page() {
  const lines = [];
  lines.push('Diagnostic du bot Discord');
  lines.push('=========================');
  lines.push(`Service démarré : ${state.startedAt.toISOString()}`);
  lines.push('');

  lines.push('Variables d\'environnement :');
  for (const [key, value] of Object.entries(state.env)) {
    lines.push(`  ${key.padEnd(12)} ${value}`);
  }
  lines.push('');

  if (state.bot) {
    lines.push(`ÉTAT : CONNECTÉ — ${state.bot.tag}`);
    lines.push(`Serveurs : ${state.bot.guilds}`);
    lines.push(`Depuis : ${state.bot.since.toISOString()}`);
    lines.push('');
    lines.push('Le bot est en ligne. Tape /setup tout dans Discord.');
  } else {
    lines.push('ÉTAT : NON CONNECTÉ');
    if (state.error) {
      lines.push(`Erreur : ${state.error.message}`);
      lines.push(`Conseil : ${state.error.hint}`);
      lines.push(`Tentatives : ${state.error.attempts} (nouvelle tentative chaque minute)`);
    } else {
      lines.push('Connexion en cours… recharge la page dans quelques secondes.');
    }
  }

  return lines.join('\n');
}

function start() {
  const port = process.env.PORT;
  if (!port) return null;

  const fs = require('node:fs');
  const path = require('node:path');
  const bannerFile = path.join(__dirname, '..', '..', 'assets', 'banner.png');

  const server = http.createServer((request, response) => {
    const url = request.url ?? '/';

    // La bannière du serveur, utilisée par les embeds de cadrage.
    if (url.startsWith('/banner.png')) {
      try {
        const image = fs.readFileSync(bannerFile);
        response.writeHead(200, {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
        });
        response.end(image);
        return;
      } catch {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end(
          'No assets/banner.png in the repository. Use /banniere in Discord to set the image.',
        );
        return;
      }
    }

    // /health répond toujours 200 : Render garde le service éveillé.
    if (url.startsWith('/health')) {
      response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('ok');
      return;
    }

    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(page());
  });

  server.listen(Number(port), () => {
    console.log(`[web] page de diagnostic sur le port ${port}`);
  });

  return server;
}

module.exports = { start, setEnvReport, setBot, setError, hintFor };
