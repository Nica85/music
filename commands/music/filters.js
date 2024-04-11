const { ChatInputCommandInteraction, Client } = require('discord.js');
const { UpdatePlayMessage } = require('../../functions/distube/distube');
const distubeDb = require('../../models/Distube');

module.exports = {
    name: 'filters',
    description: 'escucha música con filtros especiales',
    botPerms: ['Administrator'],
    category: 'music',
    options: [
        {
            name: 'opciones',
            description: 'selecciona un filtro',
            type: 3,
            required: true,
            choices: [
                { name: '3d', value: '3d' },
                { name: 'bassboost', value: 'bassboost' },
                { name: 'surround', value: 'surround' },
                { name: 'echo', value: 'echo' },
                { name: 'karaoke', value: 'karaoke' },
                { name: 'nightcore', value: 'nightcore' },
                { name: 'vaporwave', value: 'vaporwave' },
                { name: 'flanger', value: 'flanger' },
                { name: 'tremolo', value: 'tremolo' },
                { name: 'gate', value: 'gate' },
                { name: 'haas', value: 'haas' },
                { name: 'reverse', value: 'reverse' },
                { name: 'mcompand', value: 'mcompand' },
                { name: 'phaser', value: 'phaser' },
                { name: 'earwax', value: 'earwax' },
                { name: 'desactivar', value: 'off' },
            ]
        }
    ],

    /**
     * @param {Client} music 
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, music) {

        const { guild, options, member, channel } = interaction;
        const filter = options.getString('opciones');

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

            const queue = await music.distube.getQueue(voicechannel);

            if (!queue) {
                await interaction.followUp({ content: '⚠️ | Lo siento, no hay colas activas!' });
                return false;
            }

            if (filter === 'off' && queue.filters.size) {
                queue.filters.clear();
            } else if (Object.keys(music.distube.filters).includes(filter)) {
                if (queue.filters.has(filter)) {
                    queue.filters.remove(filter);
                } else {
                    queue.filters.add(filter);
                }
            }

            await UpdatePlayMessage(queue, music);

            await interaction.followUp({ content: `✅ | Filtros actuales \`${queue.filters.names.join(', ') || 'Desactivado'}\`` });
            return true;

        } catch (e) {
            console.log(e);
            await interaction.followUp({ content: '❌ | Lo siento, ocurrió un error al ejecutar el comando!' });
            return false;
        }
    }
}