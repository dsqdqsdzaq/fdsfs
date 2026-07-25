const config = require('../config');
const db = require('../database/db');

module.exports = {
  name: 'userUpdate',
  async execute(oldUser, newUser) {
    // Le "Server Tag" est une propriété de l'utilisateur (pas du membre), donc ce
    // changement se propage souvent via userUpdate plutôt que guildMemberUpdate.
    try {
      const primaryGuild = newUser.primaryGuild;
      if (!primaryGuild) return;

      for (const guild of newUser.client.guilds.cache.values()) {
        const member = await guild.members.fetch(newUser.id).catch(() => null);
        if (!member) continue;

        if (primaryGuild.identityEnabled && primaryGuild.identityGuildId === guild.id) {
          if (!member.roles.cache.has(config.ROLE_SERVER_TAG)) {
            await member.roles.add(config.ROLE_SERVER_TAG).catch(() => {});
            db.updateMember(member.id, { hasTag: true });
          }
        } else if (db.getMember(member.id).hasTag && member.roles.cache.has(config.ROLE_SERVER_TAG)) {
          await member.roles.remove(config.ROLE_SERVER_TAG).catch(() => {});
          db.updateMember(member.id, { hasTag: false });
        }
      }
    } catch (e) {
      // primaryGuild non supporté sur cette version de discord.js
    }
  },
};
