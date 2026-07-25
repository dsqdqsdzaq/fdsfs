const { cacheGuildInvites } = require('../utils/inviteTracker');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);

    for (const guild of client.guilds.cache.values()) {
      await cacheGuildInvites(guild);
    }

    console.log('📨 Cache des invitations initialisé.');
  },
};
