const { Client, GatewayIntentBits, Partials, Collection, ActivityType } = require('discord.js');
const { LoadEvents, LoadHandlers } = require('./functions/bot/CommandsHandler');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify')
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');
require('dotenv').config();

const music = new Client({
    closeTimeout: 5000,
    shards: 'auto',
    allowedMentions: {
        parse: ['roles', 'users'],
        repliedUser: true,
    },
    rest: { timeout: 60000 },
    failIfNotExists: false,
    presence: { activities: [{ name: '', type: 2/*, url: 'http://twitch.tv/nicaina'*/ }], status: 'online' },
    waitGuildTimeout: 15000,
    partials: [Partials.User, Partials.Message, Partials.GuildMember, Partials.ThreadMember, Partials.Channel, Partials.Reaction, Partials.GuildScheduledEvent],
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent
    ],
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
music.distube = new DisTube(music, {
    emitNewSongOnly: false,
    leaveOnEmpty: true,
    leaveOnFinish: true,
    leaveOnStop: true,
    //emptyCooldown:30_000,
    //youtubeCookie:'',
    //directLink: true,
    //emitAddListWhenCreatingQueue: false,
    emitAddSongWhenCreatingQueue: false,
    plugins: [
        new SpotifyPlugin({
            emitEventsAfterFetching: true
        }),
        new SoundCloudPlugin(),
        new YtDlpPlugin({ update: true })
    ]
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
music.events = new Collection();
music.commands = new Collection();
music.timeout = new Collection();
LoadEvents(music);
LoadHandlers(music);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = music;
music.login(process.env.DISCORD_CLIENT_TOKEN).catch((error) => console.log(error));