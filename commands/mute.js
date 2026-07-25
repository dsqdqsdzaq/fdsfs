const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

function parseDuration(str) {
  const match = str.match(/^(\d+)(s|m|h|j|d)$/i);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60000, h: 3600000, j: 86400000, d: 86400000 };
  return value * multipliers[unit];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Rendre muet un membre (timeout)')
    .addUserOption((o) => o.setName('membre').setDescription('Le membre à rendre muet').setRequired(true))
    .addStringOption((o) =>
      o.setName('duree').setDescription('Durée (ex: 10m, 2h, 1j) — max 28 jours').setRequired(true)
    )
    .addStringOption((o) => o.setName('raison').setDescription('Raison').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('membre');
    const durationStr = interaction.options.getString('duree');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    const ms = parseDuration(durationStr);
    if (!ms || ms > 28 * 86400000) {
      return interaction.reply({ content: '❌ Durée invalide. Utilise un format comme `10m`, `2h`, `1j` (max 28 jours).', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
    if (!member.moderatable) return interaction.reply({ content: '❌ Je ne peux pas mute ce membre.', ephemeral: true });

    await member.timeout(ms, `${reason} - par ${interaction.user.tag}`);

    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setTitle('🔇 Membre rendu muet')
      .addFields(
        { name: 'Membre', value: `${target.tag}` },
        { name: 'Durée', value: durationStr },
        { name: 'Raison', value: reason },
        { name: 'Modérateur', value: interaction.user.tag }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
