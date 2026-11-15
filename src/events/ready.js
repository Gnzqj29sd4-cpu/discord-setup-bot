'use strict';

module.exports = {
  name: 'ready',
  once: true,

  execute(client) {
    console.log(`Connecté en tant que ${client.user.tag} (${client.guilds.cache.size} serveur(s)).`);
    console.log('Commandes disponibles : /setup, /traduire, /clip');
  },
};
