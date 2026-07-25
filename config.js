module.exports = {
  // Salons dans lesquels le bot doit ping les nouveaux membres à leur arrivée
  // (uniquement un ping simple, sans le message détaillé)
  WELCOME_PING_CHANNELS: [
    '1528877108514918441',
    '1528876984896323654',
    '1528877205109739694',
  ],

  // Salon où le message détaillé de bienvenue est envoyé (avec ancienneté, inviteur, etc.)
  WELCOME_DETAIL_CHANNEL: '1528909574868963368',

  // Rôle donné automatiquement à chaque nouveau membre qui rejoint le serveur
  ROLE_ON_JOIN: '1528877758913056848',

  // Rôle donné quand quelqu'un active le "tag" (identité / Server Tag) de ce serveur
  ROLE_SERVER_TAG: '1528877758191505601',

  // Rôle donné quand quelqu'un a boosté le serveur 2 fois (ou plus)
  ROLE_BOOST_X2: '1528877757621338282',

  // Rôle donné quand quelqu'un a invité au moins 2 personnes (qui restent sur le serveur)
  ROLE_INVITE_X2: '1528877756824293491',

  // Nombre de boosts requis pour le rôle boost
  BOOST_THRESHOLD: 2,

  // Nombre d'invitations (membres restés sur le serveur) requises pour le rôle invite
  INVITE_THRESHOLD: 2,

  // Salon où les transcripts de tickets fermés sont envoyés
  TRANSCRIPT_CHANNEL: '1528912202516533258',

  // ==== A CONFIGURER TOI-MEME (mets tes propres IDs) ====
  // Catégorie Discord où les tickets seront créés (clic droit sur la catégorie -> Copier l'ID)
  TICKET_CATEGORY: 'METTRE_ID_CATEGORIE_TICKETS',

  // Rôle(s) du staff qui peuvent voir/gérer tous les tickets
  STAFF_ROLE_IDS: ['METTRE_ID_ROLE_STAFF'],

  // Rôle(s) autorisés à utiliser les commandes de modération (ban, mute, clear...)
  // Laisse vide [] pour se baser uniquement sur les permissions Discord (Bannir, Expulser, Gérer les messages...)
  MOD_ROLE_IDS: [],
};
