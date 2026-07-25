const db = require('../database/db');

// Charge le cache des invites d'un serveur en mémoire + le sauvegarde en base
async function cacheGuildInvites(guild) {
  try {
    const invites = await guild.invites.fetch();
    const cache = {};
    invites.forEach((inv) => {
      cache[inv.code] = { uses: inv.uses || 0, inviterId: inv.inviter ? inv.inviter.id : null };
    });

    // Invitations "vanity" (lien personnalisé du serveur), gérées séparément
    if (guild.vanityURLCode) {
      try {
        const vanity = await guild.fetchVanityData();
        cache['VANITY'] = { uses: vanity.uses || 0, inviterId: null };
      } catch (e) { /* pas de permission ou pas de vanity url */ }
    }

    db.setInvitesCache(guild.id, cache);
    return cache;
  } catch (e) {
    console.error('Erreur cache invites:', e.message);
    return {};
  }
}

// Compare l'ancien et le nouveau cache pour déterminer qui a invité le nouveau membre
async function resolveInviter(guild) {
  const before = db.getInvitesCache(guild.id);
  const after = await cacheGuildInvites(guild); // met aussi à jour la base

  let usedCode = null;
  let inviterId = null;

  for (const code of Object.keys(after)) {
    const prevUses = before[code] ? before[code].uses : 0;
    const newUses = after[code].uses;
    if (newUses > prevUses) {
      usedCode = code;
      inviterId = after[code].inviterId;
      break;
    }
  }

  return { code: usedCode, inviterId };
}

module.exports = { cacheGuildInvites, resolveInviter };
