const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Supprimer un nombre de messages dans le salon actuel')
    .addIntegerOption((o) =>
      o.setName('nombre').setDescription('Nombre de messages à supprimer (1-100)').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('nombre');
    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: '❌ Le nombre doit être entre 1 et 100.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });
    const deleted = await interaction.channel.bulkDelete(amount, true).catch(() => null);

    if (!deleted) {
      return interaction.editReply({ content: "❌ Impossible de supprimer ces messages (peut-être trop vieux, >14 jours)." });
    }

    await interaction.editReply({ content: `✅ ${deleted.size} message(s) supprimé(s).` });
  },
};
