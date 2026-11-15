# Bot Discord — simple

Un bot Discord simple : quelques commandes, un serveur qui se crée tout seul.
Rôles, salons et couleurs se règlent dans **`src/config.js`**.

## Les commandes

| Commande | Effet |
| --- | --- |
| `/setup` | Crée les rôles et les salons manquants (ne supprime rien) |
| `/setup reset:true` | Supprime d'abord les salons de `config.js`, puis les recrée |
| `/traduire texte:salut langue:English` | Traduit ton texte dans **la langue que tu choisis** |
| `/clip titre:… description:… lien:… image:…` | Publie un clip : miniature, bouton « Regarder le clip », réactions ❤️ 🔥 |

C'est tout. Trois commandes, pas de menu, pas de salon spécial.

## La traduction

Tu écris `/traduire`, tu tapes ton texte, tu choisis la langue dans le menu déroulant
(🇫🇷 Français, 🇬🇧 English, 🇪🇸 Español, 🇵🇹 Português, 🇩🇪 Deutsch, 🇷🇺 Русский, 🇹🇷 Türkçe,
🇮🇹 Italiano, 🇸🇦 العربية). Le bot répond avec la traduction dans un embed.

Exemple : `/traduire texte:salut langue:English` → **hi**.

Aucune réaction, aucun drapeau sous les messages : c'est toi qui décides, à chaque
commande. La traduction utilise le service public de Google, sans clé et sans compte.

## Les salons créés par `/setup`

```
📢・INFORMATION     📜・règles (lecture seule)   📢・annonces (lecture seule)
💬・COMMUNAUTÉ      💬・général   🎬・clips   🎓・tutoriels
🛡️・STAFF          💼・staff     🚨・logs      (invisible pour les membres)
🔊・VOCAL          🔊・Général (vocal)
```

Les rôles : OWNER, ADMIN, MODERATOR, Manager, CONTENT MANAGER, SUPPORT-LVL1/2/3,
TEST-SUPPORTER, SUPPORTER, Security, STREAMER, CREATOR LVL1/2/3, TEST CREATOR, CC,
OG CUSTOMER, Server Booster, member.

À l'arrivée d'un membre : rôle **member** + message de bienvenue dans `💬・général`.
Quand quelqu'un boost : rôle **Server Booster** ajouté, retiré quand le boost s'arrête.

## Personnaliser

Tout est dans **`src/config.js`**, dans l'ordre :

- `roles` — les rôles, du plus haut au plus bas.
- `roleGroups` — le groupe `staff` (qui voit les salons privés).
- `accessPresets` — `public` (tout le monde écrit), `readonly` (seul le staff écrit),
  `staff` (invisible pour les membres).
- `categories` — les catégories et leurs salons (`text` ou `voice`).
- `autoRolesOnJoin`, `boosterRole`, `welcome`.
- `languages` — les langues du menu de `/traduire`.
- `clips` — couleur, footer, réactions, salon autorisé pour `/clip`.

Après une modification : relance le bot, puis `/setup` (ou `/setup reset:true` pour
repartir de zéro).

## Mettre le bot en ligne

### 1. Créer l'application Discord

1. https://discord.com/developers/applications → **New Application**.
2. Onglet **General Information** : copie l'**Application ID** → c'est `CLIENT_ID`.
3. Onglet **Bot** : **Reset Token** → copie le token → c'est `DISCORD_TOKEN`.
4. Toujours dans **Bot**, active **SERVER MEMBERS INTENT** (pour les rôles à l'arrivée),
   puis **Save Changes**.

### 2. Inviter le bot

Onglet **OAuth2 > URL Generator** : coche `bot` + `applications.commands`, coche
**Administrator**, ouvre l'URL, choisis ton serveur, **Autoriser**.

Puis sur Discord : **Paramètres du serveur > Rôles** et glisse le rôle du bot
**tout en haut** de la liste.

### 3. Faire tourner le bot (gratuit)

**Option A — GitHub Actions** (aucun compte à créer, le dépôt doit être public) :

1. Dépôt > **Settings** > **Secrets and variables** > **Actions** >
   **New repository secret**, trois fois :
   `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID` (l'ID de ton serveur).
2. Onglet **Actions** > **Bot Discord** > **Run workflow**.

Le bot tourne 6 h par exécution, puis la suivante reprend automatiquement. Un push sur
`main` le redémarre proprement.

**Option B — Render** (gratuit, sans coupure avec un ping) :

1. https://render.com → **New** > **Web Service** > choisis ce dépôt (le fichier
   `render.yaml` fait le reste).
2. Dans **Environment**, ajoute `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`.
3. Pour éviter la mise en veille : https://uptimerobot.com, monitor **HTTP(s)** sur
   l'adresse du service, toutes les 5 minutes.

**Page de diagnostic** : ouvre l'adresse du service Render, elle affiche
`ÉTAT : CONNECTÉ — …` ou l'erreur exacte (token, intents, variables). Le bot ne s'arrête
plus en cas d'erreur : il réessaie chaque minute.

### 4. Configurer le serveur

Sur Discord : `/setup`, puis c'est prêt. `/clip` et `/traduire` sont utilisables tout
de suite.

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
- **`/clip` refuse les liens** : le lien et l'image doivent commencer par `http://` ou
  `https://`.
