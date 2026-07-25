const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database/db');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addinvites')
    .setDescription("Ajuster manuellement le compteur d'invitations d'un membre")
    .addUserOption((o) => o.setName('membre').setDescription('Le membre').setRequired(true))
    .addIntegerOption((o) => o.setName('nombre').setDescription("Nombre total d'invitations à définir").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const target = interaction.options.getUser('membre');
    const count = interaction.options.getInteger('nombre');

    db.updateMember(target.id, { invites: count });

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member && count >= config.INVITE_THRESHOLD && !member.roles.cache.has(config.ROLE_INVITE_X2)) {
      await member.roles.add(config.ROLE_INVITE_X2).catch(() => {});
    }

    await interaction.reply({ content: `✅ Compteur d'invitations de ${target.tag} défini à ${count}.`, ephemeral: true });
  },
};
