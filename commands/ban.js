const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannir un membre du serveur')
    .addUserOption((o) => o.setName('membre').setDescription('Le membre à bannir').setRequired(true))
    .addStringOption((o) => o.setName('raison').setDescription('Raison du bannissement').setRequired(false))
    .addIntegerOption((o) =>
      o.setName('supprimer_messages').setDescription('Jours de messages à supprimer (0-7)').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('membre');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';
    const deleteDays = interaction.options.getInteger('supprimer_messages') || 0;

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member && !member.bannable) {
      return interaction.reply({ content: "❌ Je ne peux pas bannir ce membre (rôle trop élevé).", ephemeral: true });
    }

    await interaction.guild.members.ban(target.id, {
      reason: `${reason} - par ${interaction.user.tag}`,
      deleteMessageSeconds: deleteDays * 86400,
    });

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle('🔨 Membre banni')
      .addFields(
        { name: 'Membre', value: `${target.tag} (${target.id})` },
        { name: 'Raison', value: reason },
        { name: 'Modérateur', value: `${interaction.user.tag}` }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
