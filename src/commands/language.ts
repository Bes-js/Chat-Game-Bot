import { Client, SlashCommandBuilder, CommandInteraction, CommandInteractionOptionResolver, Snowflake } from 'discord.js';
import { lang } from '../index';

export default {
  data: new SlashCommandBuilder()
    .setName('language')
    .setNameLocalizations({ 'tr': 'dil' })
    .setDescription('Set the language of the bot')
    .setDescriptionLocalizations({ 'tr': 'Botun Dilini Ayarlar'})
    .addStringOption(option =>
        option.setName('language')
        .setNameLocalizations({ 'tr': 'dil' })
        .setDescription('The language of the bot')
        .setDescriptionLocalizations({ 'tr': 'Botun dili' })
        .setRequired(true)
    )
    .toJSON(),
  async execute(client: Client, interaction: CommandInteraction,options: CommandInteractionOptionResolver) {
    await interaction.deferReply();
   
    var selectedLang = options.getString('language') as string;
     
    if(!lang.getAllLangs().some(x => selectedLang == x))return interaction.editReply({ content: (await lang.getText({ key: 'languageError',guildId: interaction.guildId as Snowflake}))?.replace('{allLangs}',lang.getAllLangs().join(", ")) }).catch((err) => { });
    lang.setLang({lang:selectedLang,guildId:interaction.guildId as Snowflake});
    interaction.editReply({ content: (await lang.getText({ key: 'languageSuccess',guildId: interaction.guildId as Snowflake}))?.replace('{lang}',selectedLang) }).catch((err) => { });



  },
};