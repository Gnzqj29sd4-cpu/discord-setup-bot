# Bot Discord — orange & black

Un bot Discord simple : trois commandes, un serveur qui se crée tout seul en anglais,
avec une charte orange et noir. Tout se règle dans **`src/config.js`**.

## Les commandes

| Commande | Effet |
| --- | --- |
| `/salon` | Crée les rôles et les salons manquants, puis publie les règles et l'information |
| `/salon reset:true` | Supprime d'abord les salons de `config.js`, puis tout recrée |
| `/traduire texte:salut langue:English` | Traduit ton texte dans **la langue que tu choisis** |
| `/clip titre:… description:… lien:… image:…` | Publie un clip : miniature, bouton « REGARDER LE CLIP », réactions ❤️ 🔥 |

## Les salons créés par `/salon`

```
📌・INFORMATION     📜・rules    📢・announcements    📋・information   (lecture seule)
💬・COMMUNITY       💬・general   🎬・clips    🎓・tutorials
🛡️・STAFF          💼・staff     🚨・logs     (invisible pour les membres)
🔊・VOICE          🔊・General (vocal)
```

Tous les noms sont en anglais, comme demandé.

**Publication automatique** : `/salon` poste lui-même, sans doublon :

- dans `📜・rules` — l'embed orange **📜 Server Rules** (les 8 règles) et l'embed noir
  **⚠️ Staff Policy** (les 4 points) ;
- dans `📋・information` — l'embed orange **📋 Information** (langue, clips, traduction,
  support).

Si tu relances `/salon`, le bot vérifie le footer de chaque embed avant de poster : rien
n'est dupliqué, rien n'est écrasé.

## Le design orange et noir

La section `theme` de `config.js` :

- `primary` = `0xff5900` (orange) — titres, règles, information, `/clip`, rôle MODERATOR
  et Server Booster.
- `dark` = `0x141414` (noir) — embed de la politique du staff.

## Les rôles

OWNER, ADMIN, MODERATOR, Manager, CONTENT MANAGER, SUPPORT-LVL1/2/3, TEST-SUPPORTER,
SUPPORTER, Security, STREAMER, CREATOR LVL1/2/3, TEST CREATOR, CC, OG CUSTOMER,
Server Booster, member.

À l'arrivée : rôle **member** + message de bienvenue dans `💬・general` (en anglais).
Boost : rôle **Server Booster** ajouté, retiré quand le boost s'arrête.

## La traduction

`/traduire` : tu tapes ton texte, tu choisis la langue dans le menu déroulant
(🇫🇷 🇬🇧 🇪🇸 🇵🇹 🇩🇪 🇷🇺 🇹🇷 🇮🇹 🇸🇦), le bot répond avec la traduction.
Aucune réaction, aucun drapeau : c'est toi qui décides, à chaque commande.

## Personnaliser

Tout est dans **`src/config.js`** :

- `theme` — les deux couleurs.
- `roles`, `roleGroups`, `accessPresets` — rôles et permissions.
- `categories` — les catégories et leurs salons.
- `rules` — le texte des règles et de la politique du staff.
- `information` — le contenu du salon d'information.
- `autoRolesOnJoin`, `boosterRole`, `welcome`.
- `languages`, `translation`, `clips`.

Après une modification : relance le bot, puis `/salon`.

## Mettre le bot en ligne

### 1. Créer l'application Discord

1. https://discord.com/developers/applications → **New Application**.
2. **General Information** : copie l'**Application ID** → `CLIENT_ID`.
3. Onglet **Bot** : **Reset Token** → copie le token → `DISCORD_TOKEN`.
4. Toujours dans **Bot**, active **SERVER MEMBERS INTENT** (rôles à l'arrivée), **Save**.

### 2. Inviter le bot

**OAuth2 > URL Generator** : `bot` + `applications.commands`, **Administrator**, ouvre
l'URL, choisis ton serveur, **Autoriser**. Puis **Paramètres du serveur > Rôles** :
glisse le rôle du bot **tout en haut**.

### 3. Faire tourner le bot (gratuit)

**GitHub Actions** (aucun compte à créer, dépôt public) :

1. **Settings** > **Secrets and variables** > **Actions** > **New repository secret** :
   `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`.
2. Onglet **Actions** > **Bot Discord** > **Run workflow**.

**Render** (gratuit, sans coupure avec un ping) : **New** > **Web Service** > ce dépôt
(`render.yaml` fait le reste), ajoute les trois variables, puis un monitor
https://uptimerobot.com toutes les 5 minutes sur l'adresse du service.

La page du service Render affiche `ÉTAT : CONNECTÉ — …` ou l'erreur exacte. Le bot ne
s'arrête plus en cas d'erreur : il réessaie chaque minute.

### 4. Configurer le serveur

Sur Discord : `/salon`. C'est tout — rôles, salons, règles et information sont en place.

## Commandes du projet (terminal)

```bash
npm install      # installe les dépendances
npm start        # démarre le bot (enregistre les commandes au démarrage)
npm run deploy   # enregistre les commandes sans démarrer le bot
npm run invite   # affiche le lien d'invitation
```

## Dépannage

- **Les commandes n'apparaissent pas** : le bot n'est pas connecté (regarde les logs),
  ou `CLIENT_ID` / `GUILD_ID` manquent.
- **« Missing Permissions »** : le rôle du bot est trop bas, ou il manque *Gérer les
  salons* / *Gérer les rôles*.
- **Les rôles à l'arrivée ne marchent pas** : active **SERVER MEMBERS INTENT**.
- **Les règles ne sont pas publiées** : le salon `📜・rules` n'existe pas encore — lance
  `/salon` une première fois, il crée puis publie.
- **`/clip` refuse les liens** : le lien et l'image doivent commencer par `http://` ou
  `https://`.
