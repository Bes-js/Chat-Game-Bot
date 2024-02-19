import fs from 'fs';
import path from 'path';
import { db } from '../index';
import settings from '../config/settings';

type LangOptions = { lang?: string, guildId?: string};
type TextOptions = { key: string, guildId?: string};
type getLangOptions = { guildId?: string};

export class LangService {
lang:string;
constructor({lang = settings.systemLanguage || 'en'}:LangOptions){
this.lang = lang;
};


/**
 * @param {LangOptions} options
 * @returns {string}
 * @memberof LangService
 * @description Set the language of the bot
 * @example setLang({lang:'en'})
 * @async
 */
async setLang(options:LangOptions):Promise<string>{
this.lang = options.lang || settings.systemLanguage || 'en';
if(options.guildId)await db.set(`lang_${options.guildId}`, this.lang);
return this.lang;
}


/**
 * @param {getLangOptions} options
 * @returns {string}
 * @memberof LangService
 * @description Get the language of the bot
 * @example getLang({guildId:'1234567890'})
 * @async
 */
async getLang(options:getLangOptions):Promise<string>{
var langData = await db.get(`lang_${options.guildId}`) || settings.systemLanguage || 'en';
return langData;
};


/**
 * @param {TextOptions} options
 * @returns {string}
 * @memberof LangService
 * @description Get the text of the bot
 * @example getText({key:'commandError',guildId:'1234567890'})
 * @async
 */
async getText(options:TextOptions):Promise<string|undefined> {
var langData = await this.getLang({guildId:options.guildId});
var file = fs.existsSync(path.join(__dirname,`../langs/${langData}.json`)) ? require(path.join(__dirname,`../langs/${langData}.json`)) : require(path.join(__dirname,`../langs/en.json`));
if(file[options.key])return file[options.key] as string;
else return undefined;
};


/**
 * @returns {string[]}
 * @memberof LangService
 * @description Get the list of languages
 * @example getLangList()
 */
getAllLangs():string[]{
var files = fs.readdirSync(path.join(__dirname,`../langs`)).filter(file => file.includes('.json'));
return files.map(x => x.split('.')[0]);
};


};