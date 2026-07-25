const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const db = require('../database/db');
const { accountAge, ordinal } = require('../utils/helpers');
const { resolveInviter } = require('../utils/inviteTracker');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const { guild, user } = member;

    // 1) Détermine qui a invité ce membre (lien classique ou lien vanity/personnalisé)
    const { code, inviterId } = await resolveInviter(guild);

    let inviterText = "un lien d'invitation inconnu";
    if (code === 'VANITY') {
      inviterText = "le lien d'invitation personnalisé du serveur";
    } else if (inviterId) {
      const inviter = await guild.members.fetch(inviterId).catch(() => null);
      inviterText = inviter ? `**${inviter.user.username}**` : "un membre";

      // Incrémente le compteur d'invites de l'inviteur, et attribue le rôle si seuil atteint
      const inviterData = db.getMember(inviterId);
      const newCount = (inviterData.invites || 0) + 1;
      db.updateMember(inviterId, { invites: newCount });

      if (newCount >= config.INVITE_THRESHOLD) {
        const inviterMember = await guild.members.fetch(inviterId).catch(() => null);
        if (inviterMember && !inviterMember.roles.cache.has(config.ROLE_INVITE_X2)) {
          await inviterMember.roles.add(config.ROLE_INVITE_X2).catch((e) =>
            console.error('Impossible d\'ajouter le rôle invite:', e.message)
          );
        }
      }
    } else if (code) {
      inviterText = `le lien d'invitation \`${code}\``;
    }

    // 2) Détermine si c'est la première fois que ce membre rejoint (déjà vu = "de nouveau")
    const memberData = db.getMember(user.id);
    const timesText = memberData.joinedBefore ? 'à nouveau' : `pour la ${ordinal(1)} fois`;
    db.updateMember(user.id, { joinedBefore: true });

    // 3) Construit le message façon "Legion - Protect"
    const genre = "Il/Elle";
    const welcomeText =
      `${user} vient de nous rejoindre ${timesText}, son compte a été créé ${accountAge(user.createdTimestamp)}. ` +
      `${genre} a été invité(e) par ${inviterText}. Nous sommes désormais **${guild.memberCount}** !`;

    // 4) Envoie le message détaillé (avec ancienneté, inviteur, etc.) dans le salon dédié
    const detailChannel = guild.channels.cache.get(config.WELCOME_DETAIL_CHANNEL);
    if (detailChannel) {
      detailChannel.send({ content: welcomeText }).catch((e) =>
        console.error('Erreur envoi message détaillé de bienvenue:', e.message)
      );
    }

    // 5) Envoie juste un ping simple (mention du membre) dans les autres salons configurés,
    //    puis supprime ce message au bout de 2 secondes
    for (const channelId of config.WELCOME_PING_CHANNELS) {
      const channel = guild.channels.cache.get(channelId);
      if (!channel) continue;
      channel
        .send({ content: `${user}` })
        .then((msg) => {
          setTimeout(() => {
            msg.delete().catch(() => {});
          }, 2000);
        })
        .catch((e) => console.error(`Erreur ping bienvenue dans ${channelId}:`, e.message));
    }

    // 6) Attribue automatiquement le rôle de bienvenue au nouveau membre
    if (config.ROLE_ON_JOIN) {
      await member.roles.add(config.ROLE_ON_JOIN).catch((e) =>
        console.error("Impossible d'ajouter le rôle de bienvenue:", e.message)
      );
    }
  },
};
