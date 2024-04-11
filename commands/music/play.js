const { ChatInputCommandInteraction, Client } = require('discord.js');
const distubeDb = require('../../models/Distube');

module.exports = {
    name: 'play',
    description: 'reproduce una canción o una lista de reproducción',
    botPerms: ['Administrator'],
    category: 'music',
    options: [
        {
            name: 'cancion',
            description: 'proporciona el nombre de una canción o un link',
            type: 3,
            required: true,
        }
    ],

    /**
     * @param {Client} music 
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, music) {

        const { guild, options, member, channel } = interaction;
        const song = options.getString('cancion');

        const musicData = await distubeDb.findOne({ serverId: guild.id });

        if (!musicData) {
            await interaction.reply({ content: '⚠️ | Lo siento, el sistema de música no esta configurado!', ephemeral: true });
            return false;
        }

        if (musicData.channelId && musicData.channelId !== channel.id) {
            await interaction.reply({ content: `⚠️ | Lo siento, este comando solo puedes utilizarlo en el canal <#${musicData.channelId}>`, ephemeral: true });
            return false;
        }

        const voicechannel = member?.voice?.channel;

        if (!voicechannel) {
            await interaction.reply({ content: '⚠️ | Lo siento, necesitas unirte a un canal de voz para utilizar el comando!', ephemeral: true });
            return false;
        }

        if (guild.members.me?.voice?.channel && voicechannel.id !== guild.members.me.voice.channel.id) {
            await interaction.reply({ content: `⚠️ | Lo siento, la música ya se está reproduciendo en <#${guild.members.me.voice.channel.id}>, necesitas estar en el mismo canal de voz que yo!`, ephemeral: true });
            return false;
        }

        await interaction.deferReply({ ephemeral: true });

        try {

            await music.distube.play(voicechannel, song, { textChannel: channel, member: member });

            await interaction.followUp({ content: '✅ | Solicitud recibida, en breve iniciare con la reproducción!' });
            return true;

        } catch (e) {
            console.log(e);
            await interaction.followUp({ content: '❌ | Lo siento, ocurrió un error al ejecutar el comando!' });
            return false;
        }
    }
}