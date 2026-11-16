'use strict';

module.exports = {
  name: 'ready',
  once: true,

  execute(client) {
    console.log(`Connecté en tant que ${client.user.tag} (${client.guilds.cache.size} serveur(s)).`);
    console.log(
      'Commands: /salon, /resetsalon, /clip, /flash, /banniere, /traduire, /annonce, /giveaway, /xp, /classement',
    );

    // Les giveaways en cours reprennent après un redémarrage.
    const giveaway = client.commands.get('giveaway');
    if (giveaway?.resumeGiveaways) {
      try {
        giveaway.resumeGiveaways(client);
        console.log('[giveaway] giveaways en cours reprogrammés.');
      } catch (error) {
        console.warn('[giveaway] reprise impossible :', error.message);
      }
    }
  },
};
