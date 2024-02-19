import { Events, Message, Client, ChannelType } from "discord.js";
import { db } from '../index';
import { IBoomGameData, IWordGameData, ICountingGameData } from "../schemas/index";
import wordGameHandler from '../handlers/wordGame';
import boomGameHandler from '../handlers/boomGame';
import countingGameHandler from "../handlers/countingGame";

export default {
name: Events.MessageCreate,
async run(client:Client,message:Message) {
if(message.channel.type !== ChannelType.GuildText || message.author?.bot)return;

var wordGameData = await db.get(`wordGame_${message.guild?.id}`) as IWordGameData;
var boomGameData = await db.get(`boomGame_${message.guild?.id}`) as IBoomGameData;
var countingGameData = await db.get(`countingGame_${message.guild?.id}`) as ICountingGameData;
if(wordGameData && wordGameData.active && wordGameData.channelId == message.channel.id)return wordGameHandler(message);
if(boomGameData && boomGameData.active && boomGameData.channelId == message.channel.id)return boomGameHandler(message);
if(countingGameData && countingGameData.active && countingGameData.channelId == message.channel.id)return countingGameHandler(message);




}
};