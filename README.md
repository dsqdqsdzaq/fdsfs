# Bot Discord

Bot complet : message de bienvenue, modération, rôles automatiques (invitations, boosts, tag serveur), système de tickets avec transcript.

## 1. Installation

```bash
npm install
```

## 2. Configuration

1. Crée une application sur https://discord.com/developers/applications
2. Onglet **Bot** → active tous les **Privileged Gateway Intents** :
   - SERVER MEMBERS INTENT
   - MESSAGE CONTENT INTENT
   - PRESENCE INTENT
3. Copie `.env.example` en `.env` et remplis :
   ```
   DISCORD_TOKEN=le_token_du_bot
   CLIENT_ID=id_de_l_application
   GUILD_ID=id_de_ton_serveur
   ```
4. Invite le bot avec les permissions : `Administrator` (le plus simple), ou au minimum : Gérer les rôles, Gérer les salons, Gérer les messages, Bannir des membres, Expulser des membres, Muet des membres (Timeout), Voir les salons, Envoyer des messages, Joindre des fichiers.
   ⚠️ Le rôle du bot doit être **au-dessus** des 3 rôles à attribuer (tag, boost, invite) et du rôle staff dans la hiérarchie des rôles du serveur.

5. Ouvre `config.js` et complète les 2 valeurs manquantes :
   - `TICKET_CATEGORY` : l'ID de la catégorie où créer les salons de tickets
   - `STAFF_ROLE_IDS` : le(s) rôle(s) staff qui voient tous les tickets

   Tous les autres IDs (salons de bienvenue, rôles tag/boost/invite, salon transcript) sont déjà pré-remplis avec ceux que tu as fournis.

## 3. Déploiement des commandes slash

```bash
npm run deploy
```

## 4. Lancer le bot

```bash
npm start
```

## Fonctionnalités

### Message de bienvenue
À chaque arrivée, le bot envoie automatiquement le message (façon "Legion - Protect") dans les 8 salons configurés, avec la mention du membre, l'ancienneté du compte, le lien/l'inviteur utilisé, et le nombre de membres.

### Rôles automatiques
- **Tag serveur** : dès qu'un membre active le "Server Tag" de ton serveur sur son profil → rôle `1528877758191505601`.
- **Boost x2** : dès qu'un membre atteint 2 boosts détectés → rôle `1528877757621338282`.
- **Invitations x2** : dès qu'un membre a fait rejoindre 2 personnes → rôle `1528877756824293491`.

### Commandes de modération
- `/ban membre raison supprimer_messages`
- `/unban id`
- `/mute membre duree raison` (ex: `10m`, `2h`, `1j`)
- `/unmute membre`
- `/clear nombre` — supprime N messages dans le salon actuel (1-100)
- `/clearall salon` — vide **entièrement** un salon choisi (clone + suppression, instantané)
- `/rank membre` — affiche les stats d'un membre (invitations, boosts, tag)
- `/addinvites` / `/addboost` — ajuster manuellement les compteurs (voir limitations ci-dessous)

### Tickets
- `/ticketpanel` — poste le menu déroulant avec : Demande d'aide / Devenir leaker / Contacter un owner
- Chaque choix crée un salon privé (membre + staff uniquement)
- Boutons "Prendre en charge" et "Fermer le ticket" dans chaque ticket
- À la fermeture, un transcript HTML est généré et envoyé dans le salon `1528912202516533258`, puis le salon est supprimé après 5 secondes.

## ⚠️ Limitations techniques importantes

1. **Boost x2** : l'API Discord ne donne pas aux bots le "nombre de fois" qu'un même utilisateur a boosté (cas des comptes avec plusieurs boosts Nitro appliqués d'un coup). Le bot incrémente de 1 à chaque activation détectée du boost sur le membre. Si un membre applique plusieurs boosts en une fois, utilise `/addboost membre nombre` pour corriger manuellement.

2. **Tag serveur** : c'est une fonctionnalité récente de Discord (encore en déploiement progressif). Elle nécessite `discord.js >= 14.16`. Si `user.primaryGuild` n'est pas disponible dans ta version, le bot ignore simplement cette détection sans planter — mets à jour discord.js (`npm update discord.js`) si la détection ne fonctionne pas.

3. **Invitations** : seules les invitations classiques et le lien personnalisé (vanity URL) sont suivis. Si un membre quitte puis revient avec la même invitation, cela recompte comme une nouvelle invitation réussie (comportement standard des bots d'invite-tracking).

4. **`/clearall`** : le salon est recréé (clone + suppression de l'ancien), ce qui réinitialise aussi les statistiques Discord liées au salon (mais conserve permissions, nom, position, topic). C'est la seule méthode fiable pour supprimer plus de 14 jours de messages d'un coup.
