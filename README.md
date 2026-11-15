# Bot Discord — orange & black

Un bot Discord simple : quatre commandes, un serveur qui se crée tout seul en anglais,
avec une charte orange et noir. Tout se règle dans **`src/config.js`**.

## Les commandes

| Commande | Effet |
| --- | --- |
| `/salon` | Crée les rôles et les salons manquants, puis publie les règles et l'information |
| `/resetsalon confirmer:true` | Supprime les salons de `config.js` (à relancer avec `/salon` ensuite) |
| `/clip lien:…` | Publie un clip TikTok, YouTube, Instagram, Twitch, X… |
| `/traduire texte:salut langue:English` | Traduit ton texte dans **la langue que tu choisis** |

## Les salons créés par `/salon`

```
📌・INFORMATION   📜・rules   📢・announcements   📋・information   (lecture seule)
💬・COMMUNITY     💬・general   🎓・tutorials
🎬・CLIPS         📱・tiktok   ▶️・youtube   📸・instagram   🎮・twitch
                  🎬・other-clips   🏆・best-clips (lecture seule)
🛡️・STAFF         💼・staff   🚨・logs   (invisible pour les membres)
🔊・VOICE         🔊・General (vocal)
```

Un salon par plateforme : tu postes le clip TikTok dans `📱・tiktok`, la vidéo YouTube
dans `▶️・youtube`, etc.

**Publication automatique** : `/salon` poste lui-même, sans doublon, l'embed orange
**📜 Server Rules** (8 règles) + l'embed noir **⚠️ Staff Policy** dans `📜・rules`, et
l'embed **📋 Information** dans `📋・information`. Si tu relances `/salon`, le bot vérifie
son footer avant de poster : rien n'est dupliqué.

## `/clip` — TikTok et les autres

```
/clip lien:https://vm.tiktok.com/ZMabc123/
/clip lien:https://youtu.be/xxxx titre:My best goal image:https://…/mini.jpg
```

- **Le lien est le seul champ obligatoire** ; `titre`, `description` et `image` sont
  facultatifs.
- Le lien peut être collé sans `https://` (le bot le rajoute) et avec les balises `< >`
  de Discord (il les retire).
- La plateforme est détectée automatiquement depuis le lien : TikTok, YouTube,
  Instagram, Twitch, X. Le bouton devient **WATCH ON TIKTOK**, **WATCH ON YOUTUBE**, etc.
- **Miniature TikTok automatique** : sans `image`, le bot va chercher la couverture de la
  vidéo via l'API oEmbed publique de TikTok (aucune clé, aucun compte).
- Le clip est publié dans le salon où tu tapes la commande, avec les réactions ❤️ 🔥.

## Le design orange et noir

Section `theme` de `config.js` : `primary` = `0xff5900` (orange, titres et embeds),
`dark` = `0x141414` (noir, embed de la politique du staff).

## Les rôles

OWNER, ADMIN, MODERATOR, Manager, CONTENT MANAGER, SUPPORT-LVL1/2/3, TEST-SUPPORTER,
SUPPORTER, Security, STREAMER, CREATOR LVL1/2/3, TEST CREATOR, CC, OG CUSTOMER,
Server Booster, member.

À l'arrivée : rôle **member** + message de bienvenue dans `💬・general` (en anglais).
Boost : rôle **Server Booster** ajouté, retiré quand le boost s'arrête.

## La traduction

Deux façons, les deux disponibles :

**1. Par drapeau** — le bot ajoute automatiquement 🇫🇷 🇬🇧 🇸🇦 sous chaque message.
Tu cliques sur le drapeau de la langue voulue, le bot répond avec la traduction en
réponse au message (auteur, langue détectée, langue cible). Une seule réponse par
message et par langue, même si plusieurs personnes cliquent.

**2. Par commande** — `/traduire texte:salut langue:English`, avec le menu déroulant
des 9 langues.

Google est utilisé en premier, MyMemory prend le relais si Google ne répond pas : deux
services gratuits, sans clé ni compte.

Réglages dans `config.js`, section `flags` : `enabled` (désactiver les drapeaux),
`languages` (quels drapeaux, par code : `fr`, `en`, `ar`…), `exclude` (salons sans
drapeaux), `color` (orange `0xff7900`), `maxLength`.

Les drapeaux demandent l'intent **MESSAGE CONTENT** et la permission *Add Reactions*.

## Personnaliser

Tout est dans **`src/config.js`** :

- `theme` — les deux couleurs.
- `roles`, `roleGroups`, `accessPresets` — rôles et permissions.
- `categories` — les catégories et leurs salons.
- `rules`, `information` — les textes publiés automatiquement.
- `autoRolesOnJoin`, `boosterRole`, `welcome`.
- `languages`, `translation`, `clips` (plateformes détectées, réactions, footer).

Après une modification : relance le bot, puis `/salon`.

## Mettre le bot en ligne

### 1. Créer l'application Discord

1. https://discord.com/developers/applications → **New Application**.
2. **General Information** : copie l'**Application ID** → `CLIENT_ID`.
3. Onglet **Bot** : **Reset Token** → copie le token → `DISCORD_TOKEN`.
4. Toujours dans **Bot**, active **SERVER MEMBERS INTENT** (rôles à l'arrivée) et
   **MESSAGE CONTENT INTENT** (lecture du texte pour les drapeaux de traduction),
   puis **Save Changes**.

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

### 4. Configurer le serveur

Sur Discord : `/salon`. C'est tout.

## Commandes du projet (terminal)

```bash
npm install      # installe les dépendances
npm start        # démarre le bot (enregistre les commandes au démarrage)
npm run deploy   # enregistre les commandes sans démarrer le bot
npm run invite   # affiche le lien d'invitation
```

## Dépannage

- **Les commandes n'apparaissent pas** : vérifie `GUILD_ID` dans les secrets. Avec lui,
  les commandes du serveur apparaissent en quelques secondes et les anciennes commandes
  globales sont effacées automatiquement. Sans lui, il faut attendre jusqu'à 1 h.
  Ferme et rouvre Discord après un redémarrage : le client garde la liste en cache.
- **« Missing Permissions »** : le rôle du bot est trop bas, ou il manque *Gérer les
  salons* / *Gérer les rôles*.
- **Les rôles à l'arrivée ne marchent pas** : active **SERVER MEMBERS INTENT**.
- **Les drapeaux n'apparaissent pas** : active **MESSAGE CONTENT INTENT** et vérifie que
  le bot a la permission *Add Reactions* dans le salon, et que le salon n'est pas dans
  `flags.exclude`.
- **Les règles ne sont pas publiées** : le salon `📜・rules` n'existe pas encore — lance
  `/salon` une première fois, il crée puis publie.
- **`/clip` refuse le lien** : il doit ressembler à un vrai lien
  (`tiktok.com/…`, `youtu.be/…`). Un texte sans point est refusé.
- **Pas de miniature TikTok** : TikTok ne répond pas toujours à l'API oEmbed ; passe
  `image:` avec l'URL de ta couverture.
