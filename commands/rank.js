const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db');
const { accountAge } = require('../utils/helpers');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription("Afficher les statistiques d'un membre")
    .addUserOption((o) => o.setName('membre').setDescription('Le membre (toi par défaut)').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getUser('membre') || interaction.user;
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    const data = db.getMember(target.id);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setAuthor({ name: target.tag, iconURL: target.displayAvatarURL() })
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: '📅 Compte créé', value: accountAge(target.createdTimestamp), inline: true },
        { name: '📥 A rejoint', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Inconnu', inline: true },
        { name: '🔗 Invitations', value: `${data.invites || 0}`, inline: true },
        { name: '💎 Boosts détectés', value: `${data.boosts || 0}`, inline: true },
        { name: '🏷️ Tag serveur actif', value: data.hasTag ? 'Oui' : 'Non', inline: true },
        {
          name: '🎖️ Rôles obtenus',
          value:
            [
              member?.roles.cache.has(config.ROLE_INVITE_X2) ? '🔗 Invitations' : null,
              member?.roles.cache.has(config.ROLE_BOOST_X2) ? '💎 Boost x2' : null,
              member?.roles.cache.has(config.ROLE_SERVER_TAG) ? '🏷️ Tag' : null,
            ]
              .filter(Boolean)
              .join(', ') || 'Aucun',
          inline: false,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
