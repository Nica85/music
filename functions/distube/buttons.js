const { Client, ButtonInteraction, EmbedBuilder } = require('discord.js');
const { UpdatePlayMessage } = require('./distube');
const distubeDb = require('../../models/Distube');

/**
 * 
 * @param {ButtonInteraction} interaction 
 * @param {Client} music 
 * @returns 
 */
async function DistubeButtons(interaction, music) {

    try {

        const { guild, customId, member } = interaction;

        if (!['mMResumen', 'mMPause', 'mMNext', 'mMAutoplay', 'mMRepeatsong', 'mMRepeatqueue', 'mMMezclar', 'mMStop'].includes(customId)) return;

        await interaction.deferReply({ ephemeral: true });

        let data = await distubeDb.findOne({ serverId: guild.id });

        if (!data) {
            await interaction.followUp({ content: '⚠️ | Lo siento, el sistema de música no esta configurado, contacta con el owner y reporta el error!' });
            return false;
        }

        if (!data?.channelId && !data?.parentId && !data?.messageIdPlay && !data?.messageIdQueue) {
            await interaction.followUp({ content: '⚠️ | Lo siento, faltan datos requeridos, contacta con el owner y reporta el error!' });
            return false;
        }

        const voicechannel = member?.voice?.channel;
        if (!voicechannel) {
            await interaction.followUp({ content: '⚠️ | Lo siento, necesitas estar en un canal de voz!' });
            return false;
        }

        let queue = await music.distube.getQueue(voicechannel);

        if (!queue) {
            await interaction.followUp({ content: '⚠️ | Lo siento, no hay canciones en cola!' });
            return false;
        }

        if (guild.members.me.voice.channel && voicechannel.id !== guild.members.me.voice.channelId) {
            await interaction.followUp({ content: '⚠️ | Lo siento, necesitas estar en mi canal de voz para utilizar el botón!' });
            return false;
        }

        switch (customId) {

            case 'mMResumen': {

                if (!queue.paused) {
                    await interaction.followUp({ content: '⚠️ | Lo siento, la reproducción aún no se ha pausado!' });
                    return false;
                }

                await queue.resume();

                await interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Aqua')
                            .setDescription('✅ | Reproducción reanudada con éxito')
                    ]
                });
            }
                break;

            case 'mMPause': {

                if (queue.paused) {
                    await interaction.followUp({ content: '⚠️ | Lo siento, la reproducción ya está pausada!' });
                    return false;
                }

                await queue.pause();

                await interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Aqua')
                            .setDescription('✅ | Reproducción pausada con éxito!')
                    ]
                });
            }
                break;

            case 'mMNext': {

                if (!queue.songs[1]) {

                    await queue.stop();

                    await interaction.followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Aqua')
                                .setDescription('✅ | La Reproducción ha sido detenida en el servidor, hasta pronto!')
                        ]
                    });
                    return true;
                }

                await queue.skip();

                await interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Aqua')
                            .setDescription('✅ | Pista actual omitida con éxito!')
                    ]
                });
            }
                break;

            case 'mMAutoplay': {

                let mode = await queue.toggleAutoplay(voicechannel);
                await UpdatePlayMessage(queue, music);

                await interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Aqua')
                            .setDescription(`✅ | Autoplay configurada en **${mode ? 'On' : 'Off'}**!`.replace('On', 'Activada').replace('Off', 'Desactivada'))
                    ]
                });
            }
                break;

            case 'mMRepeatsong': {

                let mode1 = queue.repeatMode;

                if (mode1 === 1) {

                    await queue.setRepeatMode(0);
                    await UpdatePlayMessage(queue, music);

                    await interaction.followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Aqua')
                                .setDescription('✅ | Repetición de canción desactivada con éxito!')
                        ]
                    });
                    return true;
                }

                await queue.setRepeatMode(1);
                await UpdatePlayMessage(queue, music);

                await interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Aqua')
                            .setDescription('✅ | Repetición de canción activada con éxito!')
                    ]
                });
            }
                break;

            case 'mMRepeatqueue': {

                let mode2 = queue.repeatMode;

                if (mode2 === 2) {

                    await queue.setRepeatMode(0);
                    await UpdatePlayMessage(queue, music);

                    await interaction.followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Aqua')
                                .setDescription('✅ | Repetición de cola desactivada con éxito!')
                        ]
                    });
                    return true;
                }

                await queue.setRepeatMode(2);
                await UpdatePlayMessage(queue, music);

                await interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Aqua')
                            .setDescription('✅ | Repetición de cola activada con éxito!')
                    ]
                });
            }
                break;

            case 'mMMezclar': {

                await queue.shuffle(voicechannel);

                await interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Aqua')
                            .setDescription('✅ | Reproducción mezclada con éxito!')
                    ]
                });
            }
                break;

            case 'mMStop': {

                await queue.stop();

                await interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Aqua')
                            .setDescription('✅ | La Reproducción ha sido detenida en el servidor, hasta pronto!')
                    ]
                });
            }
                break;
        }

    } catch (e) {
        console.log(e);
        await interaction.followUp({ content: '⚠️ | Lo siento, ocurrió un error con el botón!' });
        return false;
    }
}

module.exports = {
    DistubeButtons
}