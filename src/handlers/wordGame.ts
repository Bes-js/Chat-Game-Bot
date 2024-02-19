import { EmbedBuilder, Message, Snowflake } from 'discord.js';
import { lang, db } from '../index';
import axios, { AxiosResponse } from 'axios';
import { IWordGameURL } from '../schemas/index';


var urls: IWordGameURL = {
    tr: 'https://sozluk.gov.tr/gts?ara={word}',
    en: 'https://api.dictionaryapi.dev/api/v2/entries/en/{word}'
};

export default async (message: Message) => {
    if (!message.content) {
        message.delete().catch((err) => { });
        message.channel?.send({ content: (await lang.getText({ key: 'emptyMessage', guildId: message.guildId as Snowflake })) }).deleteMessage(3);
    };

    
    if ([".", "!", ",", "-", "*", "/", "&", "^"].some(x => message.content.startsWith(x))) return message.react('➡️').catch((err) => { });
    var gameTour = await db.get(`tour_${message.guild?.id}`) || 1;
    if (resetWords(message) && gameTour < 30) return message.channel.send({ content: (await lang.getText({ key: 'gameTourError', guildId: message.guildId as Snowflake }))?.replace('{tour}', gameTour).replace('{maxTour}',(30).toString()) }).deleteMessage(3);
    if (resetWords(message)) {
        await db.delete(`${message.guild?.id}_lastWord`).catch((err) => { });
        await db.delete(`${message.guild?.id}_usedList`).catch((err) => { });
        await db.delete(`tour_${message.guild?.id}`).catch((err) => { });
        message.react('🔃').catch((err) => { });
        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor('Yellow')
                    .setDescription((await lang.getText({ key: 'gameReset', guildId: message.guildId as Snowflake }))?.replace('{userMention}', `<@!${message.member?.id}>`) || '')
            ]
        }).catch((err) => { });
    };

    axios({
        url: urls[(await lang.getLang({guildId: message.guildId as Snowflake}))].replace('{word}', message.content.toLowerCase().trim()),
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(async (res) => {
        var wordGameStatus = getWordGameData(res);
        var usedList = await db.get(`${message.guild?.id}_usedList`) || [];
        var lastWord = await db.get(`${message.guild?.id}_lastWord`);

        if (lastWord && lastWord.authorId == message.author.id){ 
            message.delete().catch((err) => { });
            return message.channel.send({ content: (await lang.getText({ key: 'sameUserError', guildId: message.guildId as Snowflake })) }).deleteMessage(3);
        };
        if (usedList.includes(message.content.toLowerCase().trim())){
            message.delete().catch((err) => { });
            return message.channel.send({ content: (await lang.getText({ key: 'usedWordError', guildId: message.guildId as Snowflake })) }).deleteMessage(3);
        };
        if (!lastWord) {
            await db.push(`${message.guild?.id}_usedList`, message.content.toLowerCase().trim());
            await db.set(`${message.guild?.id}_lastWord`, { word: message.content.toLowerCase().trim().charAt(message.content.length - 1), authorId: message.author.id });
            message.react('🟢').catch((err) => { });
            await db.add(`point_${message.author.id}_${message.guild?.id}`, 5);
            await db.add(`tour_${message.guild?.id}`, 1);

        } else
            if (wordGameStatus && lastWord && message.content.toLowerCase().trim().charAt(0) == lastWord.word) {
                await db.push(`${message.guild?.id}_usedList`, message.content.toLowerCase().trim());
                await db.set(`${message.guild?.id}_lastWord`,{ word: message.content.toLowerCase().trim().charAt(message.content.length - 1), authorId: message.author.id });
                await db.add(`point_${message.author.id}_${message.guild?.id}`, 5);
                await db.add(`tour_${message.guild?.id}`, 1);
                message.react('🟢').catch((err) => { });

            } else {
                message.delete().catch((err) => { });
                if (lastWord && message.content.toLowerCase().trim().charAt(0) !== lastWord.word) return message.channel.send({
                    content: (await lang.getText({ key: 'lastWordError', guildId: message.guildId as Snowflake }))?.replace('{userMention}', `<@!${message.member?.id}>`).replace('{lastWord}', lastWord.word)
                }).deleteMessage(3);

                if (!wordGameStatus){
                 message.channel.send({
                    content: (await lang.getText({ key: 'wordNotFound', guildId: message.guildId as Snowflake }))?.replace('{userMention}', `<@!${message.member?.id}>`).replace('{word}', message.content.toLowerCase().trim())
                }).deleteMessage(3);
            };

            };

    }).catch(async(err) => {
        message.reply({ content: (await lang.getText({ key: 'wordNotFound', guildId: message.guildId as Snowflake }))?.replace('{userMention}', `<@!${message.member?.id}>`).replace('{word}', message.content.toLowerCase().trim()) }).deleteMessage(3);
    });


};


/**
 * @param message 
 * @returns 
 */
function resetWords(message: Message): boolean {
    if (["reset", "sıfırla"].some(x => message.content.toLowerCase().includes(x))) return true;
    return false;
};

/**
 * @param response 
 * @returns 
 */
function getWordGameData(response: AxiosResponse): boolean {
    var returns: string[] = ["error", "title"];
    if (returns.some(x => response.data[x])) return false;
    return true;
};