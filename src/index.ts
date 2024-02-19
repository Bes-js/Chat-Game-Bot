import chalk from 'chalk';
import settings from './config/settings';
import Bot from './services/client';
const client = new Bot();
import db from './services/database';
import { Events } from 'discord.js';
import { LangService } from './services/lang';
import { loadClient, getSlashData } from './services/clientHandlers';

loadClient();

const lang = new LangService({ lang: settings.systemLanguage });

export default client;
export { lang, db, getSlashData };

client.on(Events.ClientReady, async () => {
    console.log(chalk.green(`${(await lang.getText({ key: 'ready' }))}`));
});


client.login(settings.discordBotToken).catch(async(err: Error) => {
    console.log(chalk.red(`${(await lang.getText({ key: 'loginError' }))?.replace("{errorMessage}", err.message)}`));
});


declare global {
    interface Promise<T> {
        deleteMessage(time: number): void;
    }
};

Promise.prototype.deleteMessage = function (this: Promise<any>, time: number): void {
    this.then((s: any) => {
        if (s.deletable) {
            setTimeout(async () => {
                s.delete().catch((e: any) => { });
            }, time * 1000);
        }
    });
};