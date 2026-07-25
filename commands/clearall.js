const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearall')
    .setDescription('Supprimer TOUS les messages d\'un salon (le salon est recréé)')
    .addChannelOption((o) =>
      o
        .setName('salon')
        .setDescription('Le salon à vider entièrement')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const channel = interaction.options.getChannel('salon');

    await interaction.reply({ content: `🧹 Nettoyage complet de ${channel} en cours...`, ephemeral: true });

    const position = channel.position;
    const newChannel = await channel.clone({
      name: channel.name,
      reason: `Clear all demandé par ${interaction.user.tag}`,
    });

    await newChannel.setPosition(position).catch(() => {});
    await channel.delete(`Clear all demandé par ${interaction.user.tag}`).catch(() => {});

    await newChannel.send(`🧹 Ce salon a été entièrement nettoyé par ${interaction.user}.`);
  },
};
