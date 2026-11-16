# Bot Discord — clips only

Un bot Discord de clips : **que des salons de clips**, une commande pour publier,
la traduction par drapeau, et une charte orange et noir. Tout se règle dans
**`src/config.js`**.

## Les commandes

**Deux façons de les appeler** : en slash (`/flash`) ou **en texte avec `!`**
(`!flash`). Si les slash ne sortent pas dans Discord, utilise le `!` : ça marche
toujours, sans rien attendre.

| Slash | Texte | Effet |
| --- | --- | --- |
| `/salon` | `!salon` | Crée les rôles et les 10 salons de clips manquants |
| `/salon installer:true` | `!salon installer:true` | **Installe tous les salons** : supprime ceux de `config.js`, puis les recrée tous |
| `/resetsalon confirmer:true` | `!resetsalon confirmer:true` | Supprime seulement les salons de `config.js` |
| `/clip lien:…` | `!clip lien:…` | Publie un clip (TikTok, YouTube, Instagram, Twitch, Kick…) |
| `/flash` | `!flash` | Poste uniquement la bannière du serveur, **sans aucun texte** |
| `/banniere image:…` | `!banniere` (avec l'image en pièce jointe) | Définit la bannière affichée au-dessus des photos et vidéos |
| `/traduire texte:salut langue:English` | `!traduire salut English` | Traduit ton texte dans la langue choisie |
| — | `!aide` | Liste toutes les commandes |

Le préfixe se change dans `config.js` : `prefix = '!'`.

## Les salons : 10 salons de clips numérotés

```
🎬・CLIPS
  🎬・clip-1    🎬・clip-2    🎬・clip-3    🎬・clip-4    🎬・clip-5
  🎬・clip-6    🎬・clip-7    🎬・clip-8    🎬・clip-9    🎬・clip-10
```

**10 salons, accessibles à 100 %.** Chaque salon est en accès complet pour @everyone :
voir, écrire, joindre des fichiers, réagir. Rien n'est en lecture seule, rien n'est
réservé au staff. Le nombre se règle avec `clipChannelCount` dans `config.js`.

## `/clip`

```
/clip lien:https://vm.tiktok.com/ZMabc123/
/clip lien:https://youtu.be/xxxx titre:My best goal image:https://…/mini.jpg
```

- **Seul `lien` est obligatoire** ; `titre`, `description`, `image` sont facultatifs.
- Le lien peut être collé sans `https://` et avec les balises `< >` de Discord.
- Plateforme détectée automatiquement : TikTok, YouTube, Instagram, Twitch, Kick,
  Facebook, Snapchat, Reddit, X. Le bouton devient **WATCH ON TIKTOK**, etc.
- **Miniature TikTok automatique** sans `image`, via l'API oEmbed publique de TikTok.
- Réactions ❤️ 🔥 ajoutées automatiquement.

## La bannière et le cadre des photos/vidéos

Quand quelqu'un poste **une photo ou une vidéo** dans un salon de clips, le bot répond
automatiquement avec :

1. **ta bannière** en pleine largeur, au-dessus ;
2. **le média encadré** juste en dessous (bordure orange `0xff5900`, nom de l'auteur,
   pied de page `CORTISOLSCRIPT • CONTENT CREATOR TEAM`).

Le texte écrit par la personne n'est **pas** recopié dans le cadre : seule l'image compte.
Pour poster la bannière seule, sans texte, utilise `/flash`.

**Pour mettre ta bannière** : `/banniere image:<ta photo>` — envoie l'image en pièce
jointe dans l'option. Elle est enregistrée et utilisée pour tous les messages suivants.
La commande te donne aussi la ligne `BANNER_URL` à coller dans les variables de
l'hébergeur pour que la bannière survive à un redéploiement (le disque est effacé à
chaque déploiement).

Autre solution, sans commande : dépose ton image en `assets/banner.png` dans le dépôt.
Le bot la sert lui-même sur `/banner.png`.

Réglages dans `config.js`, section `branding` : `enabled`, `channels` (salons concernés,
vide = tous), `frameColor`, `footer`, `bannerUrl`.

Le bot a besoin de la permission **Read Messages** et **Attach Files** pour répondre, et
de l'intent **MESSAGE CONTENT** (déjà nécessaire pour la traduction).

## La traduction

**C'est toi qui choisis la langue.** Le bot ne pose aucun drapeau sous les messages.
Tu appuies sur le bouton emoji à côté du message, tu choisis ton pays (🇫🇷 🇬🇧 🇸🇦…), et le
bot répond avec la traduction.

**Le message du bot se supprime tout au bout de 15 secondes.** Tu peux recliquer aussitôt.

Langues reconnues : 🇫🇷 fr, 🇬🇧 en, 🇪🇸 es, 🇵🇹 pt, 🇩🇪 de, 🇷🇺 ru, 🇹🇷 tr, 🇮🇹 it, 🇸🇦 ar.
Google d'abord, MyMemory en secours : deux services gratuits, sans clé.

Réglages dans `config.js`, section `flags` : `enabled`, `languages`, `deleteAfterSeconds`,
`color`, `maxLength`.

## Les rôles

OWNER, ADMIN, MODERATOR, Manager, CONTENT MANAGER, SUPPORT-LVL1/2/3, TEST-SUPPORTER,
SUPPORTER, Security, STREAMER, CREATOR LVL1/2/3, TEST CREATOR, CC, OG CUSTOMER,
Server Booster, member.

À l'arrivée : rôle **member**. Boost : rôle **Server Booster** ajouté, retiré quand le
boost s'arrête.

## Le design orange et noir

Section `theme` de `config.js` : `primary` = `0xff5900` (orange), `dark` = `0x141414`
(noir). Utilisés par les embeds de `/clip` et de `/traduire`, et par le rôle MODERATOR.

## Personnaliser

Tout est dans **`src/config.js`** :

- `theme` — les couleurs.
- `roles`, `roleGroups`, `accessPresets` — rôles et permissions.
- `categories` — les salons (une seule catégorie : `🎬・CLIPS`).
- `autoRolesOnJoin`, `boosterRole`, `welcome` (`channel: ''` = pas de message).
- `languages`, `translation`, `flags`, `clips`.

Après une modification : relance le bot, puis `/salon`.

## Mettre le bot en ligne

### 1. Créer l'application Discord

1. https://discord.com/developers/applications → **New Application**.
2. **General Information** : copie l'**Application ID** → `CLIENT_ID`.
3. Onglet **Bot** : **Reset Token** → copie le token → `DISCORD_TOKEN`.
4. Toujours dans **Bot**, active **SERVER MEMBERS INTENT** et **MESSAGE CONTENT INTENT**
   (lecture du texte pour la traduction), puis **Save Changes**.

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

Sur Discord : `/salon`. C'est tout — les 10 salons `🎬・clip-1` à `🎬・clip-10`
apparaissent, tous accessibles à tout le monde. Si des salons doivent être remis à zéro,
`/salon installer:true`.

## Commandes du projet (terminal)

```bash
npm install      # installe les dépendances
npm start        # démarre le bot (enregistre les commandes au démarrage)
npm run deploy   # enregistre les commandes sans démarrer le bot
npm run invite   # affiche le lien d'invitation
```

## Dépannage

- **Les commandes n'apparaissent pas** : utilise la version texte, `!flash`, `!clip`,
  `!salon`, `!aide` — elle ne dépend pas de l'enregistrement Discord. Pour les slash,
  vérifie `GUILD_ID` dans les secrets, puis ferme et rouvre Discord (le client garde la
  liste en cache).
- **« Missing Permissions »** : le rôle du bot est trop bas, ou il manque *Gérer les
  salons* / *Gérer les rôles*.
- **Les anciens salons sont toujours là** : `/salon` n'en supprime aucun. Lance
  `/salon installer:true` : il vide la catégorie `🎬・CLIPS` (quel que soit le nom des
  salons qu'elle contient) puis réinstalle les 10 salons `clip-1` à `clip-10`. Les
  salons d'autres catégories (ancien général, staff, règles…) restent : supprime-les à
  la main.
- **La traduction par drapeau ne marche pas** : active **MESSAGE CONTENT INTENT** dans le
  portail Discord (onglet Bot), puis redémarre le bot.
- **`/clip` refuse le lien** : il doit ressembler à un vrai lien (`tiktok.com/…`,
  `youtu.be/…`).
- **Pas de miniature TikTok** : TikTok ne répond pas toujours à l'API oEmbed ; passe
  `image:` avec l'URL de ta couverture.
