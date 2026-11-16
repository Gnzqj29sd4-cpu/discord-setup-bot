'use strict';

require('dotenv').config();

const { registerCommands } = require('./lib/commands');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  console.error('CLIENT_ID et DISCORD_TOKEN doivent être renseignés dans .env');
  process.exit(1);
}

registerCommands({ token, clientId, guildId })
  .then(({ count, guilds }) => {
    console.log(
      guilds.length > 0
        ? `${count} commande(s) enregistrée(s) sur le serveur ${guilds.join(', ')}.`
        : `${count} commande(s) enregistrée(s) globalement (peut prendre jusqu'à 1 h ; renseigne GUILD_ID pour un affichage immédiat).`,
    );
  })
  .catch((error) => {
    console.error('Enregistrement impossible :', error.message);
    process.exit(1);
  });
