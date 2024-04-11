const { Client, Message } = require('discord.js');
const distubeDb = require('../../models/Distube');

/**
 * 
 * @param {Message} message 
 * @param {Client} music 
 */
async function CheckDistubeMessages(message, music) {

    const { author, guild, member } = message;
    if (!guild) return false;
    if (author.bot) return false;

    try {

        let data = await distubeDb.findOne({ serverId: guild.id });

        if (!data) return false;

        const channel = guild.channels.cache.get(data.channelId);
        if (!channel) return false;

        if (message.channel.id !== channel.id) return false;

        const song = message.cleanContent;
        const voicechannel = member?.voice?.channel;

        if (!voicechannel) {
            const msg = await message.reply({ content: '⚠️ | Lo siento, tienes que unirte a un canal de voz!' });
            await message.delete().catch((e) => { });
            return setTimeout(() => {
                msg.delete().catch((e) => { });
            }, 5_000);
        }

        if (guild.members.me?.voice?.channelId && voicechannel.id !== guild.members.me.voice.channelId) {
            const msg = await message.reply({ content: '⚠️ | Lo siento, necesitas estar en el mismo canal de voz que estoy yo!' });
            await message.delete().catch((e) => { });
            return setTimeout(() => {
                msg.delete().catch((e) => { })
            }, 5_000);
        }

        await message.delete().catch((e) => { });
        await music.distube.play(voicechannel, song, { textChannel: channel, member: member });
        return true;

    } catch (e) {
        console.log(e);
        return false;
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = {
    CheckDistubeMessages
}