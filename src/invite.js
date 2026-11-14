'use strict';

require('dotenv').config();

// Affiche le lien d'invitation du bot (OAuth2) à ouvrir dans un navigateur.
// Permissions demandées : Administrateur (tout ce dont le bot a besoin).

const clientId = process.env.CLIENT_ID;

if (!clientId) {
  console.error(
    'CLIENT_ID manquant : ajoute-le dans .env (portail développeur Discord > General Information > Application ID).',
  );
  process.exit(1);
}

const permissions = '8'; // Administrator
const url =
  `https://discord.com/api/oauth2/authorize?client_id=${clientId}` +
  `&permissions=${permissions}&scope=bot%20applications.commands`;

console.log('\nLien d\'invitation du bot :\n');
console.log(url);
console.log(
  '\nOuvre ce lien dans un navigateur, connecté à ton compte Discord, puis choisis ton serveur.\n',
);
