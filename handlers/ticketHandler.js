const {
  EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder,
  ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType,
} = require('discord.js');
const transcripts = require('discord-html-transcripts');
const config = require('../config');
const db = require('../database/db');

const TICKET_TYPES = {
  help: { label: "Demande d'aide", emoji: '🆘', description: "J'ai besoin d'aide sur le serveur" },
  leaker: { label: 'Devenir leaker', emoji: '📰', description: 'Candidature pour devenir leaker' },
  owner: { label: 'Contacter un owner', emoji: '👑', description: 'Discuter directement avec un owner' },
};

function buildPanelEmbed() {
  return new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('🎫 Centre de support')
    .setDescription(
      "Sélectionne une option ci-dessous pour ouvrir un ticket.\n\n" +
      "🆘 **Demande d'aide** — besoin d'assistance\n" +
      "📰 **Devenir leaker** — postuler pour devenir leaker\n" +
      "👑 **Contacter un owner** — discuter avec un owner\n\n" +
      "Un salon privé sera créé pour toi."
    );
}

function buildPanelRow() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('ticket_select')
    .setPlaceholder('Choisis une catégorie de ticket')
    .addOptions(
      Object.entries(TICKET_TYPES).map(([value, t]) => ({
        label: t.label,
        description: t.description,
        value,
        emoji: t.emoji,
      }))
    );
  return new ActionRowBuilder().addComponents(menu);
}

async function sendPanel(channel) {
  await channel.send({ embeds: [buildPanelEmbed()], components: [buildPanelRow()] });
}

function ticketControlRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_claim').setLabel('Prendre en charge').setStyle(ButtonStyle.Primary).setEmoji('🙋'),
    new ButtonBuilder().setCustomId('ticket_close').setLabel('Fermer le ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
  );
}

async function createTicket(interaction) {
  const type = interaction.values[0];
  const info = TICKET_TYPES[type];
  const guild = interaction.guild;
  const user = interaction.user;

  // Empêche l'ouverture de plusieurs tickets identiques encore ouverts
  const existing = Object.entries(db.getAllTickets()).find(
    ([, t]) => t.userId === user.id && t.type === type
  );
  if (existing) {
    const chan = guild.channels.cache.get(existing[0]);
    if (chan) {
      return interaction.reply({ content: `Tu as déjà un ticket ouvert : ${chan}`, ephemeral: true });
    }
  }

  await interaction.deferReply({ ephemeral: true });

  const overwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: user.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
    },
    {
      id: interaction.client.user.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
    },
  ];

  for (const roleId of config.STAFF_ROLE_IDS) {
    if (roleId && roleId !== 'METTRE_ID_ROLE_STAFF') {
      overwrites.push({
        id: roleId,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      });
    }
  }

  const channelOptions = {
    name: `${info.emoji}-${type}-${user.username}`.slice(0, 90),
    type: ChannelType.GuildText,
    permissionOverwrites: overwrites,
    topic: `Ticket de ${user.tag} (${user.id}) - ${info.label}`,
  };

  if (config.TICKET_CATEGORY && config.TICKET_CATEGORY !== 'METTRE_ID_CATEGORIE_TICKETS') {
    channelOptions.parent = config.TICKET_CATEGORY;
  }

  const ticketChannel = await guild.channels.create(channelOptions);

  db.setTicket(ticketChannel.id, { userId: user.id, type, claimedBy: null, createdAt: Date.now() });

  const staffMentions = config.STAFF_ROLE_IDS.filter((r) => r && r !== 'METTRE_ID_ROLE_STAFF').map((r) => `<@&${r}>`).join(' ');

  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle(`${info.emoji} ${info.label}`)
    .setDescription(`Bienvenue ${user} !\nUn membre du staff va te répondre dès que possible.\n\nMerci de décrire ta demande en détail.`)
    .setFooter({ text: `Ticket ouvert par ${user.tag}` })
    .setTimestamp();

  await ticketChannel.send({
    content: `${user} ${staffMentions}`,
    embeds: [embed],
    components: [ticketControlRow()],
  });

  await interaction.editReply({ content: `✅ Ton ticket a été créé : ${ticketChannel}` });
}

async function claimTicket(interaction) {
  const ticket = db.getTicket(interaction.channel.id);
  if (!ticket) return interaction.reply({ content: "Ce salon n'est pas un ticket.", ephemeral: true });

  if (ticket.claimedBy) {
    return interaction.reply({ content: `Ce ticket est déjà pris en charge par <@${ticket.claimedBy}>.`, ephemeral: true });
  }

  db.setTicket(interaction.channel.id, { ...ticket, claimedBy: interaction.user.id });
  await interaction.reply({ content: `🙋 Ticket pris en charge par ${interaction.user}.` });
}

async function closeTicket(interaction) {
  const channel = interaction.channel;
  const ticket = db.getTicket(channel.id);
  if (!ticket) return interaction.reply({ content: "Ce salon n'est pas un ticket.", ephemeral: true });

  await interaction.reply({ content: '🔒 Fermeture du ticket en cours, transcript en cours de génération...' });

  try {
    const attachment = await transcripts.createTranscript(channel, {
      limit: -1,
      returnType: 'attachment',
      filename: `transcript-${channel.name}.html`,
      saveImages: true,
      poweredBy: false,
    });

    const transcriptChannel = interaction.guild.channels.cache.get(config.TRANSCRIPT_CHANNEL);
    if (transcriptChannel) {
      const ticketUser = await interaction.client.users.fetch(ticket.userId).catch(() => null);
      const embed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle('📄 Transcript de ticket')
        .addFields(
          { name: 'Salon', value: `#${channel.name}`, inline: true },
          { name: 'Type', value: ticket.type, inline: true },
          { name: 'Ouvert par', value: ticketUser ? `${ticketUser.tag} (${ticketUser.id})` : ticket.userId, inline: false },
          { name: 'Pris en charge par', value: ticket.claimedBy ? `<@${ticket.claimedBy}>` : 'Personne', inline: false },
          { name: 'Fermé par', value: `${interaction.user.tag}`, inline: false },
        )
        .setTimestamp();

      await transcriptChannel.send({ embeds: [embed], files: [attachment] });
    }
  } catch (e) {
    console.error('Erreur génération transcript:', e);
  }

  db.deleteTicket(channel.id);

  setTimeout(() => {
    channel.delete().catch(() => {});
  }, 5000);
}

module.exports = {
  TICKET_TYPES,
  sendPanel,
  createTicket,
  claimTicket,
  closeTicket,
};
