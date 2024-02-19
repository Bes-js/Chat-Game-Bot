import { Client, SlashCommandBuilder, CommandInteraction, CommandInteractionOptionResolver, Snowflake, PermissionFlagsBits, GuildMember, ChannelType } from 'discord.js';
import { db, lang } from '../index';
import { IWordGameData } from '../schemas/index';

export default {
    data: new SlashCommandBuilder()
        .setName('word-game')
        .setDescription('Word Game Setup/Tuning Command.')
        .setNameLocalizations({ 'tr': 'kelime-oyunu' })
        .setDescriptionLocalizations({ 'tr': 'Kelime Oyun Kurulumu / Ayarlama Komudu.' })
        .addChannelOption(option =>
            option.setName('game-channel')
                .setDescription('The channel where the game will be played.')
                .setNameLocalizations({ 'tr': 'oyun-kanalı' })
                .setDescriptionLocalizations({ 'tr': 'Oyunun oynanacağı kanal.' }))
        .addStringOption(option =>
            option.setName('active')
                .setDescription('Whether the game is active or not.')
                .setNameLocalizations({ 'tr': 'aktif' })
                .setDescriptionLocalizations({ 'tr': 'Oyunun aktif olup olmadığı.' })
                .addChoices({ name: 'Yes', value: 'yes', name_localizations: { 'tr': 'Evet' } }, { name: 'No', value: 'no', name_localizations: { 'tr': 'Hayır' } }))
        .toJSON(),
    async execute(client: Client, interaction: CommandInteraction, options: CommandInteractionOptionResolver) {
        await interaction.deferReply();

        if (!(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.Administrator)) return interaction.editReply({
            content: (await  lang.getText({ key: 'permissionError', guildId: interaction.guildId as Snowflake }))?.replace('{permission}', 'Administrator')
        }).catch((err) => { });

        var dataObject = {} as IWordGameData;

        var channel = options.getChannel('game-channel');
        var active = options.getString('active') == 'yes' ? true : false;
        if (channel && channel?.type !== ChannelType.GuildText || !channel && !active) return interaction.editReply({ content: (await lang.getText({ key: 'commandError',guildId: interaction.guildId as Snowflake })) }).catch((err) => { });

        if (channel) dataObject['channelId'] = channel.id;
        if (active) dataObject['active'] = active;
        dataObject['guildId'] = interaction.guildId as Snowflake;
        await db.set(`wordGame_${interaction.guildId}`, dataObject);

        interaction.editReply({ content: (await lang.getText({ key: 'commandSuccess', guildId: interaction.guildId as Snowflake })) }).catch((err) => { });

    },
};