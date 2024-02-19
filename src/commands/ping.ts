import { Client, SlashCommandBuilder, CommandInteraction } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!')
    .setDescriptionLocalizations({ 'tr': 'Ping komutu için cevap verir!' })
    .toJSON(),
  async execute(client: Client, interaction: CommandInteraction) {
    await interaction.deferReply();
    interaction.editReply({ content: `> \`${client.ws.ping}ms\`` }).catch((err) => { });
  },
};