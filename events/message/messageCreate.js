const { Client, Message, Events } = require('discord.js');
const { CheckDistubeMessages } = require('../../functions/distube/messages');

module.exports = {
    name: Events.MessageCreate,
    on: true,

    /**
     * 
     * @param {Message} message 
     * @param {Client} music 
     */
    async execute(message, music) {

        const { author, guild } = message;

        if (!guild) return;
        if (author?.bot) return;

        CheckDistubeMessages(message, music);

    }
}