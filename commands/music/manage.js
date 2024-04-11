const { ChatInputCommandInteraction, EmbedBuilder, Client } = require('discord.js');
const { UpdatePlayMessage } = require('../../functions/distube/distube');
const distubeDb = require('../../models/Distube');

module.exports = {
    name: 'manage',
    description: 'gestiona la reproducción actual',
    botPerms: ['Administrator'],
    category: 'music',
    options: [
        {
            name: 'opciones',
            description: 'selecciona una de las opciones',
            type: 3,
            required: true,
            choices: [
                {
                    name: '⏩ saltar cancion',
                    value: 'skip'
                },
                {
                    name: '⏸ pausar reproducción',
                    value: 'pausa'
                },
                {
                    name: '⏯​ reanudar reproducción',
                    value: 'resumen'
                },
                {
                    name: '⏹ detener reproducción',
                    value: 'stop'
                },
                {
                    name: '🔢 ver cola',
                    value: 'cola'
                },
                {
                    name: '🔀 mezclar cola',
                    value: 'mezclar'
                },
                {
                    name: '🔃 reproducción automática',
                    value: 'autoplay'
                },
                {
                    name: '♉ agregar una canción relacionada',
                    value: 'relatedsong'
                },
                {
                    name: '🔁 modo repetición',
                    value: 'repeatmode'
                }
            ]
        }
    ],

    /**
     * @param {Client} music 
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, music) {

        const { guild, options, member, channel } = interaction;
        const choices = options.getString('opciones');

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

            switch (choices) {

                case 'skip': {

                    await queue.skip(voicechannel);

                    await interaction.followUp({ content: '⏩ | Pista actual omitida!' });
                }
                    break;

                case 'stop': {

                    await queue.stop(voicechannel);

                    await interaction.followUp({ content: '⏹ | La Reproducción ha sido detenida en el servidor, hasta pronto!' });
                }
                    break;

                case 'pausa': {

                    await queue.pause(voicechannel);

                    await interaction.followUp({ content: '⏸ | Reproducción pausada!' });
                }
                    break;

                case 'resumen': {

                    await queue.resume(voicechannel);

                    await interaction.followUp({ content: '⏯ | Reproducción reanudada!' });
                }
                    break;

                case 'mezclar': {

                    await queue.shuffle(voicechannel);

                    await interaction.followUp({ content: '🔀 | Reproducción mezclada!' });
                }
                    break;

                case 'autoplay': {

                    let mode = await queue.toggleAutoplay(voicechannel);
                    await UpdatePlayMessage(queue, music);

                    await interaction.followUp({ content: `🔃 | Autoplay configurada en **${mode ? 'On' : 'Off'}**!`.replace('On', 'Activada').replace('Off', 'Desactivada') });
                }
                    break;

                case 'relatedsong': {

                    await queue.addRelatedSong(voicechannel);

                    await interaction.followUp({ content: '♉ | Canción relacionada agregada a la cola!' });
                }
                    break;

                case 'repeatmode': {

                    let mode2 = await music.distube.setRepeatMode(queue);
                    await UpdatePlayMessage(queue, music);

                    await interaction.followUp({ content: `🔁 | Modo repetición configurado en **${mode2 = mode2 ? mode2 == 2 ? 'Queue' : 'Song' : 'Off'}**`.replace('Queue', 'Cola').replace('Song', 'Canción').replace('Off', 'Desactivado') });
                }
                    break;

                case 'cola': {

                    await interaction.followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Random')
                                .setAuthor({ name: `Solicitado por ${member.displayName}`, iconURL: `${member.displayAvatarURL()}`, url: `https://discord.gg/XhRMnh3KXZ` })
                                .setTitle(`Cola de ${guild.name}`)
                                .setURL(`https://discord.gg/XhRMnh3KXZ`)
                                .setDescription(`${queue.songs.slice(0, 10).map((song, id) => `\n**${id + 1}.** ${song.name} - \`${song.formattedDuration}\``)}`)
                                .setTimestamp()
                                .setFooter({ text: `Solicitado por: ${member.displayName}`, iconURL: `${member.displayAvatarURL()}` })
                        ]
                    });
                }
                    break;
            }

        } catch (e) {
            console.log(e);
            await interaction.followUp({ content: '❌ | Lo siento, ocurrió un error al ejecutar el comando!' });
            return false;
        }
    }
}