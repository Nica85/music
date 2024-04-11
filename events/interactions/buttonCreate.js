const { Client, Events, ButtonInteraction } = require('discord.js');
const { DistubeButtons } = require('../../functions/distube/buttons');


module.exports = {
    name: Events.InteractionCreate,
    on: true,

    /**
     * 
     * @param {ButtonInteraction} interaction 
     * @param {Client} music 
     */
    async execute(interaction, music) {

        const { guild, user } = interaction;

        if (!guild) return false;
        if (user?.bot) return false;
        if (!interaction.isButton()) return false;

        DistubeButtons(interaction, music);

    }
}