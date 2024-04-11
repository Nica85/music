const { Client, EmbedBuilder } = require('discord.js');
require('colors');

/**
 * 
 * @param {Client} music 
 */
module.exports = async (music) => {

    console.log(` [ANTICRASH] :: Sistema de anticrach iniciado...`.blue);

    process.on('unhandledRejection', async (reason, p) => {

        console.log(' [ANTICRASH] ::\n'.bgRed, reason, p);

        const channel = music.channels.cache.get('1218872487417352192');
        if (!channel) return false;

        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('❌ | Error Encontrado')
                    .setDescription('**unhandled Rejection/Catch:\n\n** ```' + reason + '```')
            ],
        });
        return true;
    });

    process.on('uncaughtException', async (e, origin) => {

        console.log(' [ANTICRASH] ::\n'.bgRed, e, origin);

        const channel = music.channels.cache.get('1218872487417352192');
        if (!channel) return false;

        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('❌ | Error Encontrado')
                    .setDescription('**uncaught Exception/Catch:\n\n** ```' + e + '\n\n' + origin.toString() + '```')
            ],
        });
        return true;
    });

    process.on('uncaughtExceptionMonitor', async (e, origin) => {

        console.log(' [ANTICRASH] ::\n'.bgRed, e, origin);

        const channel = music.channels.cache.get('1218872487417352192');
        if (!channel) return false;

        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('❌ | Error Encontrado')
                    .setDescription('**uncaught Exception/Catch (MONITOR):\n\n** ```' + e + '\n\n' + origin.toString() + '```')
            ],
        });
        return true;
    });
}