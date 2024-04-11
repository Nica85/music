const { Client, EmbedBuilder } = require('discord.js');
const { UpdateMusicMessage, UpdatePlayMessage, UpdateQueueMessage } = require('../functions/distube/distube');
require('colors');

/**
 * 
 * @param {Client} music 
 */
module.exports = async (music) => {

    console.log(` [Nicaina Music] :: Sistema de música iniciado...`.blue);

    music.distube
        .on('playSong', async (queue, song) => {
            await UpdatePlayMessage(queue, music);
            await UpdateQueueMessage(queue);
            return true;
        })
        .on('addSong', async (queue, song) => {
            await UpdateQueueMessage(queue);
            return true;
        })
        .on('addList', async (queue, playlist) => {
            await UpdateQueueMessage(queue);
            return true;
        })
        .on('error', async (channel, e) => {
            if (channel) {
                const msg = await channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setTitle('Sistema de Musica')
                            .setDescription(`⚠️ | ocurrio un error: ${e.toString().slice(0, 1800)}`)
                    ]
                });
                return setTimeout(() => {
                    msg.delete().catch((e) => { });
                }, 5_000);
            }
            console.log(e);
            return true;
        })
        .on('empty', async (channel) => {
            if (channel) {
                const msg = await channel.send({
                    embds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setTitle('Sistema de Musica')
                            .setDescription('El canal de voz está vacío, hasta pronto...!')
                    ]
                });
                return setTimeout(() => {
                    msg.delete().catch((e) => { });
                }, 5_000);
            }
            return false;
        })
        .on('searchNoResult', async (message, query) => {
            const msg = await message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(`Sistema de Musica`)
                        .setDescription(`⚠️ | No encontre resultados para \`${query}\`!`)
                ]
            });
            return setTimeout(() => {
                msg.delete().catch((e) => { });
            }, 5_000);
        })
        .on('finish', async (queue) => {
            const msg = await queue.textChannel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setTitle('Sistema de Musica')
                        .setDescription('Reproducción finalizada, hasta pronto...!')
                ]
            });
            return setTimeout(() => {
                msg.delete().catch((e) => { });
            }, 5_000);
        })
        .on('disconnect', async (queue, song) => {
            await UpdateMusicMessage(queue, music);
            return true;
        });
}