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
                  🐦・x-clips   🟣・kick   📘・facebook   👻・snapchat   🟠・reddit
                  😂・funny-clips   💥・edits   🎵・music-clips   🏀・sports-clips
                  🕹️・gaming-clips   🎬・other-clips   🏆・best-clips (lecture seule)
🛡️・STAFF         💼・staff   🚨・logs   (invisible pour les membres)
🔊・VOICE         🔊・General (vocal)
```

**16 salons de clips** au total, un par plateforme et par thème : tu postes le clip TikTok
dans `📱・tiktok`, la vidéo YouTube dans `▶️・youtube`, un edit dans `💥・edits`, etc.

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
  Instagram, Twitch, Kick, Facebook, Snapchat, Reddit, X. Le bouton devient
  **WATCH ON TIKTOK**, **WATCH ON YOUTUBE**, etc.
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

**C'est toi qui choisis la langue.** Le bot ne pose **aucun drapeau** sous les messages :
rien n'apparaît en dessous. Tu appuies sur le bouton emoji à côté du message, tu choisis
ton pays (🇫🇷 🇬🇧 🇸🇦…), et le bot répond avec la traduction.

**Le message du bot se supprime tout seul au bout de 15 secondes**, pour ne pas encombrer
le salon. Tu peux recliquer le même drapeau juste après.

Toutes les langues sont reconnues : 🇫🇷 fr, 🇬🇧 en, 🇪🇸 es, 🇵🇹 pt, 🇩🇪 de, 🇷🇺 ru, 🇹🇷 tr,
🇮🇹 it, 🇸🇦 ar. Si plusieurs personnes cliquent le même drapeau en même temps, une seule
traduction est envoyée.

**Par commande** — `/traduire texte:salut langue:English`, avec le menu déroulant.

Google est utilisé en premier, MyMemory prend le relais si Google ne répond pas : deux
services gratuits, sans clé ni compte.

Réglages dans `config.js`, section `flags` : `enabled`, `languages` (quelles langues sont
reconnues, par code), `deleteAfterSeconds` (15 par défaut, `0` pour garder le message),
`color` (orange `0xff7900`), `maxLength`.

La traduction demande l'intent **MESSAGE CONTENT** (portail Discord > Bot) et la
permission *Manage Messages* pour que le bot puisse supprimer sa propre réponse.

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
- **La traduction par drapeau ne marche pas** : active **MESSAGE CONTENT INTENT** dans le
  portail Discord (onglet Bot), puis redémarre le bot. Vérifie aussi que l'emoji choisi
  est bien un drapeau de la liste `flags.languages`.
- **Les règles ne sont pas publiées** : le salon `📜・rules` n'existe pas encore — lance
  `/salon` une première fois, il crée puis publie.
- **`/clip` refuse le lien** : il doit ressembler à un vrai lien
  (`tiktok.com/…`, `youtu.be/…`). Un texte sans point est refusé.
- **Pas de miniature TikTok** : TikTok ne répond pas toujours à l'API oEmbed ; passe
  `image:` avec l'URL de ta couverture.
