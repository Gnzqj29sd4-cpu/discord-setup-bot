# Bot Discord — clips only

Un bot Discord de clips : **que des salons de clips**, une commande pour publier,
la traduction par drapeau, et une charte orange et noir. Tout se règle dans
**`src/config.js`**.

## Les commandes

Toutes les commandes sont en **slash** : tu tapes `/` dans Discord et la liste apparaît.

| Commande | Effet |
| --- | --- |
| `/salon` | Crée les rôles et les 10 salons de clips manquants |
| `/salon installer:true` | **Installe tous les salons** : supprime ceux de `config.js`, puis les recrée tous |
| `/clip lien:…` | Publie un clip (TikTok, YouTube, Instagram, Twitch, Kick…) |
| `/flash` | Poste uniquement la bannière du serveur, **sans aucun texte** |
| `/banniere image:…` | Définit la bannière affichée au-dessus des photos et vidéos |
| `/cadre image:…` | Définit le cadre CortisolClips appliqué aux photos (option `zone`) |
| `/annonce titre:… texte:…` | Publie une annonce orange et noire (staff) |
| `/giveaway prix:… minutes:… gagnants:…` | Lance un concours avec bouton « Enter » (staff) |
| `/xp membre:…` | Affiche les XP d'un membre |
| `/classement` | Top 10 des XP du serveur |

**Commandes réservées au staff** (`/annonce`, `/giveaway`) : administrateur, ou membre
ayant le rôle défini dans `MODERATOR_ROLE_ID`.

## XP et rôles de langue automatiques

- **XP** : chaque message écrit rapporte entre 5 et 15 XP, au maximum une fois par minute
  et par membre. `/xp` et `/classement` affichent les scores. Les points sont enregistrés
  dans `data/xp.json` — pour les garder entre deux déploiements, ajoute un disque
  persistant chez l'hébergeur.
- **Rôles de langue** : le bot devine la langue du message (arabe par l'alphabet, puis
  français ou anglais par les mots courants) et donne le rôle correspondant, défini par
  `ROLE_ENGLISH_ID`, `ROLE_FRENCH_ID` et `ROLE_ARABIC_ID`. Aucune dépendance externe.

## Giveaways

`/giveaway prix:Nitro minutes:60 gagnants:1` poste un embed orange avec un bouton
**🎉 Enter**. Le nombre de participations se met à jour en direct. À la fin, le bot tire
au sort les gagnants, remplace l'embed par le résultat et mentionne les gagnants.

Les giveaways sont enregistrés dans `data/giveaways.json` : après un redémarrage, ceux qui
sont encore en cours reprennent automatiquement au moment prévu.

**Pourquoi elles n'apparaissaient pas** : elles étaient enregistrées « globalement »,
ce qui peut prendre jusqu'à une heure, ou pas du tout si `GUILD_ID` manquait. Le bot
enregistre maintenant ses commandes sur **chaque serveur où il est présent**, dès la
connexion : elles apparaissent en quelques secondes. La ligne
`[commandes] 6 commande(s) enregistrée(s) sur 1 serveur(s)` dans les logs le confirme.

Si elles ne sortent toujours pas : le bot a été invité sans la permission
`applications.commands`. Réinvite-le avec le lien OAuth2 en cochant bien
`bot` **et** `applications.commands`.

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

## Le cadre CortisolClips (photos)

Quand quelqu'un poste **une photo**, le bot la place automatiquement dans ton cadre :
photo redimensionnée dans la zone centrale, cadre par-dessus, **pseudo de l'auteur**
écrit en bas. Le résultat est renvoyé en image (`cortisolclips.png`), sans qu'aucune
commande ne soit nécessaire.

**Mise en place** : `/cadre image:<ton PNG>` une seule fois. Le bot détecte tout seul la
zone transparente au centre du cadre.

Si ton cadre n'a pas de centre transparent (centre noir ou blanc opaque), indique la zone
à la main, en pourcentage de la largeur et de la hauteur :

```
/cadre image:<ton PNG> zone:12,18,76,68
```

soit `gauche,haut,largeur,hauteur` en %. Le bot te répond avec la zone qu'il a trouvée —
vérifie qu'elle correspond bien au rectangle vide de ton cadre.

**Pour que le cadre survive à un redéploiement** : la commande te donne la ligne
`FRAME_URL` à coller dans les variables de l'hébergeur (le disque est effacé à chaque
déploiement). Sinon, dépose le fichier en `assets/frame.png` dans le dépôt.

Réglages dans `config.js`, section `frame` : `enabled`, `showUsername`, `text.color`,
`text.sizeRatio` (taille du pseudo), `text.bottomRatio`.

**Les vidéos** : Discord ne permet pas de mettre une vidéo *à l'intérieur* d'une image —
son lecteur est géré par Discord et ne peut pas être encadré. Une vidéo postée reçoit donc
la bannière + le média encadré (comme avant). Pour avoir le cadre sur une vidéo, il faut
graver le cadre dans le fichier vidéo avant de l'envoyer.

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
- `moderation`, `xp`, `languageRoles` — staff, XP et rôles de langue automatiques.
- `autoRolesOnJoin`, `boosterRole`, `welcome` (`channel: ''` = pas de message).
- `languages`, `translation`, `flags`, `clips`, `branding`.

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
   `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, et si tu utilises les rôles de langue
   `MODERATOR_ROLE_ID`, `ROLE_ENGLISH_ID`, `ROLE_FRENCH_ID`, `ROLE_ARABIC_ID`.
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

### Le bot est hors ligne (grisé dans Discord)

Trois causes possibles, dans l'ordre de fréquence.

**1. GitHub Actions a arrêté l'exécution.** Une exécution dure 6 h maximum ; ensuite
GitHub doit lancer la suivante, et les exécutions planifiées peuvent avoir 10 à 60 minutes
de retard. Le workflow relance maintenant toutes les 4 h et remplace l'exécution en cours
avant sa limite, donc le trou n'est plus que d'environ une minute. Regarde l'onglet
**Actions** du dépôt : si la dernière exécution est terminée, attends le prochain
lancement ou clique sur **Run workflow**.

**2. L'exécution a échoué.** Dans l'onglet **Actions**, ouvre la dernière exécution
rouge : l'étape en échec dit pourquoi (secret manquant, `Used disallowed intents`, token
invalide). Corrige puis relance.

**3. GitHub a désactivé le planning.** Après 60 jours sans commit, GitHub coupe les
workflows planifiés : un simple commit (ou **Run workflow**) le réactive.

**Pour un bot en ligne 24 h/24 sans coupure**, héberge-le sur **Render** plutôt que sur
GitHub Actions : c'est un vrai service qui tourne en continu, avec la page de statut et
le ping UptimeRobot.

- **Les commandes n'apparaissent pas** : le bot les enregistre sur chaque serveur au
  démarrage (visible dans les logs : `[commandes] 6 commande(s) enregistrée(s) sur 1
  serveur(s)`). Ferme et rouvre Discord ensuite : le client garde la liste en cache. Si
  toujours rien, le bot a été invité sans `applications.commands` — réinvite-le.
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
