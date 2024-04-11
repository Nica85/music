const { Client, Events } = require('discord.js');
const { LoadCommandsClient } = require('../../functions/bot/CommandsHandler');
const { MongooseConnect } = require('../../functions/mongoose/mongoConnect');
require('colors');

module.exports = {
    name: Events.ClientReady,
    once: true,

    /**
     * 
     * @param {Client} music 
     */
    async execute(music) {

        try {

            LoadCommandsClient(music);
            console.log(` [CLIENTE] :: Conectado con exito como ${music.user.username}...`.cyan);

            MongooseConnect();

        } catch (e) {
            console.log(e);
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////DASHBOARD///////////////////////////////////////////////////////////////////////////////
    }
}