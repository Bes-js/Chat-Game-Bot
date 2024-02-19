import { Client, SlashCommandBuilder, CommandInteraction, EmbedBuilder, ImageURLOptions, Snowflake, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder, StringSelectMenuBuilder } from 'discord.js';
import { getSlashData, lang } from '../index';
import { repository } from '../../package.json';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setNameLocalizations({ 'tr': 'yardım' })
    .setDescription('Reply with help!')
    .setDescriptionLocalizations({ 'tr': 'Yardım komutu için cevap verir!'})
    .toJSON(),
  async execute(client: Client, interaction: CommandInteraction) {
    await interaction.deferReply();
    var slashData = getSlashData();
    if(slashData.length < 0)return interaction.editReply({ content: (await lang.getText({ key: 'noCommand', guildId: interaction.guildId as string })) }).catch((err) => { });

    var embed = new EmbedBuilder()
    .setTitle((await lang.getText({ key: 'helpMenu', guildId: interaction.guildId as Snowflake })) || null)
    .setDescription(`${slashData.map((x: any) => `</${x.name}:${x.id}>`).join(', ')}`)
    .setColor('Random')
    .setThumbnail((client.user?.displayAvatarURL({ dynamic: true } as ImageURLOptions)) as string|null)

    var row = new ActionRowBuilder<MessageActionRowComponentBuilder>()
    .addComponents([
      new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel('Invite Me')
      .setEmoji('🔗')
      .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=8&scope=applications.commands%20bot`),
      new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel('Support Server')
      .setEmoji('🔗')
      .setURL('https://discord.gg/luppux'),
      new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel('GitHub')
      .setEmoji('🔗')
      .setURL(`${repository.url.replace('git+', '')}`)
    ])

    var selectMenuRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
    .addComponents([
      new StringSelectMenuBuilder()
      .setCustomId('commandSelectMenu')
      .setOptions(slashData.map((x: any) => { return { label: "/"+x.name, value: "help-"+x.id } }))
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder((await lang.getText({ key: 'selectMenuPlaceholder', guildId: interaction.guildId as Snowflake }) || 'Select a command to get help!'))
    ])
    
    interaction.editReply({ embeds: [embed], components:[row,selectMenuRow] }).catch((err) => { });


  },
};