const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription("Débannir un membre via son ID")
    .addStringOption((o) => o.setName('id').setDescription("ID du membre à débannir").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const id = interaction.options.getString('id');

    try {
      await interaction.guild.members.unban(id, `Débanni par ${interaction.user.tag}`);
      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle('✅ Membre débanni')
        .addFields({ name: 'ID', value: id }, { name: 'Modérateur', value: interaction.user.tag })
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } catch (e) {
      await interaction.reply({ content: "❌ Impossible de débannir cet ID (introuvable dans la liste des bannis ?).", ephemeral: true });
    }
  },
};
