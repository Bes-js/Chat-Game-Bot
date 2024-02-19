import fs from 'fs';
import path from 'path';
import settings from '../config/settings';
import { Events, REST, Routes, Collection, Snowflake, RESTPutAPIApplicationCommandsResult } from 'discord.js';
import client, { lang } from '../index';

const slashData: object[] = [];

export { getSlashData, loadClient };

/**
  * Load Client
  * @returns {Promise<void>}
  * @export
  * @async
  * @function
  * @name loadClient
  * @param {void}
  */
async function loadClient(): Promise<void> {

    //* Load Events *//
    const events = fs.readdirSync(path.join(__dirname, '../events')).filter(file => file.includes('.'));
    for (const file of events) {
        const event = await import(`../events/${file}`);
        client.on(event.default.name, event.default.run.bind(null, client));
    };

    //* Load Commands *//
    const commands = new Collection() as Collection<string, any>;
    const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.includes('.'));
    for (const file of commandFiles) {
        const commandFile = await import(`../commands/${file}`);
        const command = commandFile.default || commandFile;
        commands.set(command.data.name, command);
    };

    //* Register Commands *//
    client.on(Events.ClientReady, async () => {
        try {
            const rest = new REST({ version: '10' }).setToken(settings.discordBotToken);
            var data = await rest.put(Routes.applicationCommands(client.user?.id as Snowflake),
                { body: commands.map((cmd: any) => cmd.data) }) as RESTPutAPIApplicationCommandsResult;
                for (const cmd of data) {
                    slashData.push(cmd);
                };
        } catch (error) { console.error(error); };
    });


    //* Interaction Create *//
    client.on(Events.InteractionCreate, async interaction => {
        if (interaction.isCommand()) {
            const command = commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(client, interaction, interaction.options);
                interaction.reply({ content: (await lang.getText({ key: 'commandError', guildId: interaction.guildId as Snowflake })) }).catch((err) => { });
            } catch (error) { console.error(error); };
        }
    });

};


/**
 * Get Slash Data
 * @returns {object[]}
 * @export
 * @function
 * @name getSlashData
 */
function getSlashData(): object[] {
    return slashData;
};