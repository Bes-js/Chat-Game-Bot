import { EmbedBuilder, Message, Snowflake } from 'discord.js';
import { lang, db } from '../index';

export default async (message: Message) => {
    if (!message.content) {
        message.delete().catch((err) => { });
        message.channel?.send({ content: (await lang.getText({ key: 'emptyMessage', guildId: message.guildId as Snowflake })) }).deleteMessage(3);
    };

    
    if ([".", "!", ",", "-", "*", "/", "&", "^"].some(x => message.content.startsWith(x))) return message.react('➡️').catch((err) => { });
    var gameTour = await db.get(`countingGame_tour_${message.guild?.id}`) || 1;
    if (resetWords(message) && gameTour < 200) return message.channel.send({ content: (await lang.getText({ key: 'gameTourError', guildId: message.guildId as Snowflake }))?.replace('{tour}', gameTour).replace('{maxTour}',(200).toString()) }).deleteMessage(3);
    if (resetWords(message)) {
        await db.delete(`counting_${message.guild?.id}_lastNumber`).catch((err) => { });
        await db.delete(`countingGame_tour_${message.guild?.id}`).catch((err) => { });
        message.react('🔃').catch((err) => { });
        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor('Yellow')
                    .setDescription((await lang.getText({ key: 'gameResetCounting',guildId: message.guildId as Snowflake }))?.replace('{userMention}', `<@!${message.member?.id}>`) || '')
            ]
        }).catch((err) => { });
    };

    var number: number = parseInt(message.content);
    if (isNaN(number)){
        message.delete().catch((err) => { });
        return message.channel.send({ content: (await lang.getText({ key: 'notNumberError', guildId: message.guildId as Snowflake })) }).deleteMessage(3);
    };
    var lastNumber = await db.get(`counting_${message.guild?.id}_lastNumber`);
    if(!lastNumber){
        await db.set(`counting_${message.guild?.id}_lastNumber`,1);
        await db.add(`countingGame_tour_${message.guild?.id}`, 1);
        message.delete().catch((err) => { });
        return message.channel.send({ content: (await lang.getText({ key: 'countingGameStart', guildId: message.guildId as Snowflake }))?.replace('{userMention}',`<@!${message.author?.id}>`) }).catch((err) => { });
    };
    if(lastNumber && (lastNumber + 1) == number){
    message.react('🟢').catch((err) => { });
    await db.add(`point_${message.author.id}_${message.guild?.id}`, 5);
    await db.add(`counting_${message.guild?.id}_lastNumber`, 1);
    await db.add(`countingGame_tour_${message.guild?.id}`, 1);
    }else{
    message.delete().catch((err) => { });
    return message.channel.send({ content: (await lang.getText({ key: 'boomGameError', guildId: message.guildId as Snowflake })) }).deleteMessage(3);
    }




};


/**
 * @param message 
 * @returns 
 */
function resetWords(message: Message): boolean {
    if (["reset", "sıfırla"].some(x => message.content.toLowerCase().includes(x))) return true;
    return false;
};
