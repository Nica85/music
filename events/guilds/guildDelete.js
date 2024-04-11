const { Client, Events, Guild } = require('discord.js');
const { DeleteGuildDatabase } = require('../../functions/mongoose/dataBase');

module.exports = {
    name: Events.GuildDelete,
    on: true,

    /**
     * 
     * @param {Guild} guild 
     * @param {Client} music 
     */
    async execute(guild, client) {

        DeleteGuildDatabase(guild);

    }
}