const config = require('../config');
const db = require('../database/db');

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    // ===== BOOSTS =====
    // premiumSince passe de null à une date quand le membre commence à booster.
    // L'API Discord ne fournit pas nativement le "nombre de fois" qu'un même membre
    // a boosté (slots multiples de Nitro). On incrémente donc de 1 à chaque activation
    // détectée. Si un membre applique plusieurs boosts d'un coup, utilise la commande
    // /addboost pour ajuster manuellement le compteur (voir README).
    if (!oldMember.premiumSince && newMember.premiumSince) {
      const data = db.getMember(newMember.id);
      const newCount = (data.boosts || 0) + 1;
      db.updateMember(newMember.id, { boosts: newCount });

      if (newCount >= config.BOOST_THRESHOLD && !newMember.roles.cache.has(config.ROLE_BOOST_X2)) {
        await newMember.roles.add(config.ROLE_BOOST_X2).catch((e) =>
          console.error("Impossible d'ajouter le rôle boost:", e.message)
        );
      }
    }

    // ===== SERVER TAG (identité de serveur) =====
    // Fonctionnalité récente de Discord ("Server Tag" / primary guild).
    // Nécessite discord.js >= 14.16 pour exposer user.primaryGuild.
    try {
      const primaryGuild = newMember.user.primaryGuild;
      if (primaryGuild && primaryGuild.identityEnabled && primaryGuild.identityGuildId === newMember.guild.id) {
        if (!newMember.roles.cache.has(config.ROLE_SERVER_TAG)) {
          await newMember.roles.add(config.ROLE_SERVER_TAG).catch((e) =>
            console.error("Impossible d'ajouter le rôle tag:", e.message)
          );
          db.updateMember(newMember.id, { hasTag: true });
        }
      } else if (db.getMember(newMember.id).hasTag && newMember.roles.cache.has(config.ROLE_SERVER_TAG)) {
        // Le membre a retiré son tag -> on retire le rôle
        await newMember.roles.remove(config.ROLE_SERVER_TAG).catch(() => {});
        db.updateMember(newMember.id, { hasTag: false });
      }
    } catch (e) {
      // primaryGuild non disponible sur cette version de discord.js, on ignore silencieusement
    }
  },
};
