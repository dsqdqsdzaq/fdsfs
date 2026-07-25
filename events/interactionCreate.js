const ticketHandler = require('../handlers/ticketHandler');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction);
        return;
      }

      if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
        await ticketHandler.createTicket(interaction);
        return;
      }

      if (interaction.isButton()) {
        if (interaction.customId === 'ticket_claim') {
          await ticketHandler.claimTicket(interaction);
          return;
        }
        if (interaction.customId === 'ticket_close') {
          await ticketHandler.closeTicket(interaction);
          return;
        }
      }
    } catch (error) {
      console.error('Erreur interaction:', error);
      const payload = { content: '❌ Une erreur est survenue.', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload).catch(() => {});
      } else {
        await interaction.reply(payload).catch(() => {});
      }
    }
  },
};
