const { ChatInputCommandInteraction, Client, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'velocidad de respuesta del bot',
    botPerms: ['Administrator'],
    category: 'information',

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Client} music 
     */
    async execute(interaction, music) {

        const api = await interaction.reply({
            content: '<a:datos_bot:983474634097848400> Obteniedo datos de la api!',
            fetchReply: true,
            ephemeral: true,
        });

        const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('Velocidad de Respuesta')
            .addFields([
                {
                    name: '📡 Latencia Bot',
                    value: `\`${music.ws.ping} ms\``,
                    inline: false
                },
                {
                    name: '📶 Latencia Api',
                    value: `\`${api.createdTimestamp - interaction.createdTimestamp} ms\``,
                    inline: false
                },
            ])
            .setTimestamp()

        await interaction.editReply({ content: '', embeds: [embed] });
        return true;

    }
}