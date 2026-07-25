const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ticketHandler = require('../handlers/ticketHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketpanel')
    .setDescription('Envoyer le panneau de création de tickets dans ce salon')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await ticketHandler.sendPanel(interaction.channel);
    await interaction.reply({ content: '✅ Panneau de tickets envoyé.', ephemeral: true });
  },
};
