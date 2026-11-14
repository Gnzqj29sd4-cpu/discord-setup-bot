# Discord Setup Bot

Bot Discord qui crée **tous les rôles et tous les salons** du serveur en une commande,
traduit les messages d'un clic sur un drapeau, et gère les salons tutoriels avec leurs vidéos.

## Mettre le bot sur Discord : la marche à suivre

Quatre étapes. La 1 et la 2 se font dans le navigateur du téléphone, la 3 et la 4 sur un
hébergeur gratuit (Railway) relié à ce dépôt GitHub.

### Étape 1 — Créer l'application et récupérer les identifiants

1. Ouvre https://discord.com/developers/applications (connecte-toi avec ton compte
   Discord ; sur téléphone, active « Version pour ordinateur » dans le menu du navigateur).
2. **New Application** → donne-lui un nom (ex. `Setup Bot`) → **Create**.
3. Onglet **General Information** : copie l'**Application ID** (un long nombre).
   C'est ton `CLIENT_ID`.
4. Onglet **Bot** :
   - **Reset Token** → **Copy** → garde ce token secret, c'est ton `DISCORD_TOKEN`.
   - Descends à **Privileged Gateway Intents** et active **SERVER MEMBERS INTENT** et
     **MESSAGE CONTENT INTENT** → **Save Changes**.
   (Sans ces deux interrupteurs : pas de rôles à l'arrivée, pas de traduction.)

### Étape 2 — Inviter le bot sur ton serveur

Onglet **OAuth2 > URL Generator** :

1. Dans **Scopes**, coche `bot` et `applications.commands`.
2. Dans **Bot Permissions**, coche **Administrator**.
3. Copie l'**URL** générée en bas, ouvre-la, choisis ton serveur → **Autoriser**.

Le bot apparaît dans la liste des membres, hors ligne pour l'instant.

Ensuite, sur Discord : **Paramètres du serveur > Rôles** et glisse le rôle du bot
**tout en haut** de la liste (au-dessus de OWNER). Sans ça, Discord refuse qu'il crée
et réordonne les rôles.

### Étape 3 — Mettre le bot en ligne (hébergement)

Le bot doit tourner 24 h/24, sur un serveur : il ne peut pas tourner dans FreeMilk.
Le plus simple, sans terminal, c'est **Railway** :

1. Publie ce projet sur GitHub (l'app FreeMilk peut le faire : demande-moi de créer le
   dépôt et de pousser le code).
2. Va sur https://railway.app → **Login with GitHub** → **New Project** →
   **Deploy from GitHub repo** → choisis le dépôt.
3. Dans l'onglet **Variables** du service, ajoute :
   - `DISCORD_TOKEN` = le token de l'étape 1
   - `CLIENT_ID` = l'Application ID
   - `GUILD_ID` = l'ID de ton serveur (clic droit sur l'icône du serveur > Copier
     l'identifiant ; active le mode développeur dans Discord : Paramètres > Avancés)
4. Railway lance `npm start` tout seul. Dans les **Logs**, tu dois voir
   `Connecté en tant que Setup Bot#1234`.

Autres hébergeurs, si tu préfères :

- **Render** — crée un *Web Service* depuis le dépôt GitHub, ajoute les mêmes variables
  et `PORT=3000` (le bot expose alors une page de statut sur ce port).
- **Fly.io** — `fly launch` puis `fly secrets set DISCORD_TOKEN=… CLIENT_ID=… GUILD_ID=…`
  (le `Dockerfile` fourni est utilisé automatiquement).
- **Ton ordinateur** — `npm install && npm start` dans un terminal : le bot s'arrête dès
  que tu fermes la fenêtre.

Ne mets jamais le token dans le dépôt : `.env` est déjà dans `.gitignore`.

### Étape 4 — Configurer le serveur

Sur Discord, en tant qu'admin du serveur :

1. `/setup tout` → crée les rôles, remet la hiérarchie, crée toutes les catégories, tous
   les salons et les 10 salons tutoriels avec leur présentation.
2. `/panel langues` → pose le menu de choix de langue dans `🌍・choisir-sa-langue`.
3. `/panel verification` → pose le bouton de vérification dans `✅・vérification`.

C'est tout : le serveur est prêt, les drapeaux de traduction apparaissent sous les
messages, et les nouveaux membres reçoivent leur rôle automatiquement.

## Ce que fait le bot

| Commande | Effet |
| --- | --- |
| `/setup tout` | Rôles + hiérarchie + salons + tutoriels |
| `/setup roles` | Crée seulement les rôles manquants + remet la hiérarchie |
| `/setup salons` | Crée seulement les catégories et les salons manquants |
| `/setup tutos` | Crée les salons tutoriels et poste leur présentation |
| `/setup hierarchie` | Remet les rôles dans l'ordre de `src/config.js` |
| `/setup reset confirmer:true` | Supprime **uniquement** les salons listés dans `src/config.js` |
| `/panel langues` | Envoie le menu de choix de langue (rôle automatique) |
| `/panel verification` | Envoie le bouton « Je valide les règles » |
| `/langue langue:Français` | Enregistre ta langue (rôle + traduction par défaut) |
| `/traduire texte:… langue:🇬🇧 English` | Traduit un texte |
| Clic long sur un message > Applications > **Traduire le message** | Traduit ce message |
| `/tuto ajouter nom:… titre:… description:… video:…` | Crée un salon tutoriel avec sa présentation |

## Traduction par drapeaux

Le bot pose un drapeau par langue sous chaque message des salons autorisés :

🇫🇷 🇬🇧 🇪🇸 🇵🇹 🇩🇪 🇷🇺 🇹🇷 🇮🇹 🇸🇦

Un clic sur le drapeau de la France traduit le message en **français**, un clic sur le
drapeau anglais en **anglais**, et ainsi de suite. La traduction arrive en réponse au
message, avec le texte d'origine et la langue détectée.

Aucun salon spécial n'est nécessaire : ça marche dans tous les salons texte, sauf ceux
listés dans `translation.exclude` (`📜・règles`, annonces, logs…). Pour limiter à
certains salons, remplis `translation.channels` dans `src/config.js`.

Réglages dans `src/config.js`, section `translation` :

- `flagsUnderMessages` — `false` pour désactiver les drapeaux (il reste `/traduire` et
  le menu contextuel).
- `channels` / `exclude` — où les drapeaux apparaissent.
- `defaultLanguage` — langue du menu contextuel et de `/traduire`.
- `maxLength` — longueur maximale traduite.

La traduction utilise le service public de Google (aucune clé, aucune inscription).
Le résultat est mis en cache : plusieurs clics sur le même drapeau = un seul appel.

## Salons tutoriels

`/setup tutos` crée la catégorie `🎥・TUTORIELS` et un salon par tutoriel, avec dans
chaque salon une **présentation** (titre, explication, étapes, vidéo) postée par le bot.
La base fournie compte 10 salons : `📥・installation`, `⚙️・configuration`,
`🚀・premiere-utilisation`, `⌨️・commandes`, `🎨・personnalisation`,
`🔌・modules-et-plugins`, `🔄・mise-a-jour`, `🛠️・depannage`, `💾・sauvegarde`, `❓・faq`.
Les vidéos sont vides au départ : remplis-les quand tu les as.

Pour ajouter un tutoriel :

- **rapide** : `/tuto ajouter` avec le nom du salon, le titre, la description, le lien
  de la vidéo et les étapes (`Installer | Configurer | Lancer`).
- **en série** : copie `tutorials.example.json` en `tutorials.json` à la racine du
  projet, remplis la liste (un objet par salon : `name`, `title`, `description`, `video`,
  `image`, `steps`), puis relance `/setup tutos`. Quand `tutorials.json` existe, c'est lui
  qui est utilisé à la place de la liste de `src/config.js` — pratique pour 20, 50 ou
  80 tutoriels.

Le lien vidéo est posté en clair pour que Discord affiche le lecteur dans le salon.
`image` affiche une miniature.

## Automatismes

- À l'arrivée d'un membre : rôle **Unverified** + message de bienvenue dans `👋・bienvenue`.
- Menu de langue : donne `FRENCH`, `ENGLISH`… et retire l'ancienne langue.
- Bouton de vérification : donne `member` et retire `Unverified`.
- Boost : donne/retire `Server Booster` quand un boost commence ou s'arrête.

**Rien n'est jamais écrasé.** Le bot ne modifie pas les salons ou rôles existants : il
ajoute ce qui manque. Seul `/setup reset` supprime, et seulement les salons de la config.

## Personnaliser

Tout est dans **`src/config.js`** :

- `roles` — la liste des rôles, dans l'ordre de la hiérarchie (le premier est le plus haut).
- `categories` — les catégories et leurs salons (`text`, `voice`, `forum`, `annonce`).
- `accessPresets` — qui voit et écrit : `public`, `readonly`, `staff`, `support`, `creators`.
- `languages` — les langues et leurs drapeaux (clé, libellé, code ISO, emoji).
- `translation` — drapeaux, salons exclus, langue par défaut.
- `tutorials` — les salons tutoriels et leur contenu.
- `autoRolesOnJoin`, `boosterRole`, `panel`, `welcome`.

Après une modification : relance le bot et refais `/setup salons` ou `/setup roles`.
Ce qui existe déjà est ignoré, ce qui manque est créé.

## Commandes du projet (terminal)

```bash
npm install      # installe les dépendances
npm start        # démarre le bot (enregistre aussi les commandes au démarrage)
npm run deploy   # enregistre les commandes sans démarrer le bot
npm run invite   # affiche le lien d'invitation du bot
```

Les commandes sont maintenant enregistrées automatiquement au démarrage : `npm run
deploy` n'est utile que pour les rafraîchir sans lancer le bot.

## Dépannage

- **Les commandes n'apparaissent pas** : vérifie `CLIENT_ID` et `GUILD_ID` dans les
  variables, puis redémarre le service. Sur un serveur, l'affichage est immédiat.
- **« Missing Permissions »** : le rôle du bot est trop bas dans la hiérarchie, ou il
  manque *Gérer les salons* / *Gérer les rôles*.
- **Les rôles automatiques ne marchent pas** : active **SERVER MEMBERS INTENT** dans le
  portail développeur, puis redémarre le bot.
- **Les drapeaux n'apparaissent pas** : active **MESSAGE CONTENT INTENT**, et vérifie que
  le salon n'est pas dans `translation.exclude`. Il faut aussi la permission *Ajouter des
  réactions* dans le salon.
- **« Used disallowed intents »** au démarrage : les intents ne sont pas activés dans le
  portail développeur.
- **Le bot se déconnecte sans raison** : sur un hébergeur gratuit, le service peut être
  mis en veille. Prends l'offre payante la moins chère ou un autre hébergeur.
