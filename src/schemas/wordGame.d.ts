interface IWordGameData {
guildId: string,
channelId: string,
active: boolean,
};

interface IWordGameURL {
[x: string]: string;
};


export { IWordGameData, IWordGameURL };