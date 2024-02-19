import { Client, GatewayIntentBits, Partials, Events, ActivitiesOptions, ActivityType } from 'discord.js';
import chalk from 'chalk';

export default class Bot extends Client {
    [x: string]: any;
    constructor() {
        super({
        intents: Object.keys(GatewayIntentBits).map((key) => GatewayIntentBits[key as keyof typeof GatewayIntentBits]) as GatewayIntentBits[],
        partials: Object.values(Partials) as Partials[],
        presence: {status:'dnd',activities:[{name:'Games',type: ActivityType.Playing}] as ActivitiesOptions[]}
        });

        this.on(Events.ClientReady,async() => {
        console.log(chalk.green(``))
        });

    }
};
