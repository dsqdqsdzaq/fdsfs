const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database/db');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addboost')
    .setDescription("Ajuster manuellement le compteur de boosts d'un membre")
    .addUserOption((o) => o.setName('membre').setDescription('Le membre').setRequired(true))
    .addIntegerOption((o) => o.setName('nombre').setDescription('Nombre total de boosts à définir').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const target = interaction.options.getUser('membre');
    const count = interaction.options.getInteger('nombre');

    db.updateMember(target.id, { boosts: count });

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member && count >= config.BOOST_THRESHOLD && !member.roles.cache.has(config.ROLE_BOOST_X2)) {
      await member.roles.add(config.ROLE_BOOST_X2).catch(() => {});
    }

    await interaction.reply({ content: `✅ Compteur de boosts de ${target.tag} défini à ${count}.`, ephemeral: true });
  },
};
