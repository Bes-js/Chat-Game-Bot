import { Events, Client, Interaction, Snowflake, EmbedBuilder, RESTGetAPIApplicationCommandResult } from "discord.js";
import { lang, getSlashData } from "../index";

export default {
    name: Events.InteractionCreate,
    async run(client:Client,interaction:Interaction) {
    if(interaction.isStringSelectMenu()){
    await interaction.deferReply({ ephemeral: true });
    var value = interaction.values[0];
    if(value.startsWith('help-')){
    var command = getSlashData().find((x:any) => x.id == value.split('-')[1]) as RESTGetAPIApplicationCommandResult;
    if(!command)return interaction.editReply({ content: (await lang.getText({ key: 'noCommand', guildId: interaction.guildId as Snowflake})) })

    interaction.editReply({embeds:[
    new EmbedBuilder()
    .setColor('Random')
    .setTitle(command.name.charAt(0).toUpperCase()+command.name.slice(1)
    +" "+(await lang.getText({ key: 'helpMenu', guildId: interaction.guildId as Snowflake }) || ''))
    .setDescription(
    (await lang.getText({ key: 'commandHelp', guildId: interaction.guildId as Snowflake }))?.replace('{commandName}', `\`${command.name}\``)
    .replace('{commandMention}',`</${command.name}:${command.id}>`)
    .replace('{commandDescription}',`\`${command.description}\``)
    .replace('{commandOptions}', "\n"+command.options?.map((x:any) => `> **${x.name}** - \`${x.description}\``).join('\n') || '')
    .replace('{commandLangs}', Object.keys(command?.name_localizations as object).map((x:any) => `**${x}**`).join(',') || '')
    || '')
    ]})

    }

    }


    },
    }