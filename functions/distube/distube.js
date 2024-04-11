const { Client, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const distubeDb = require('../../models/Distube');
require('colors');

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const status = (queue) =>
    `Volumen: \`${queue.volume} %\` | Filtros: \`${queue.filters.names.join(', ') || 'Desactivado'}\`\nBucle: \`${queue.repeatMode ? (queue.repeatMode === 2 ? 'All Queue' : 'This Song') : 'Desactivado'
        }\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``.replace('On', 'Activado').replace('Off', 'Desactivado').replace('All Queue', 'Toda la cola').replace('This Song', 'Esta canción');
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////// funcion para actualizar la reproduccion ////////////////////////////////////////////////////////////
/**
 * 
 * @param {Client} music 
 * @param {*} queue 
 */
async function UpdatePlayMessage(queue, music) {

    try {

        let data = await distubeDb.findOne({ serverId: queue.textChannel.guild.id });
        if (!data) return false;

        let song = queue.songs[0];
        //console.log(song);
        //console.log(queue);

        let prevSongs = queue.previousSongs;

        const channel = queue.textChannel.guild.channels.cache.get(data.channelId);
        if (!channel) return false;

        const message = await channel.messages.fetch(data.messageIdPlay).catch((e) => { });
        if (!message) return false;

        const EmbedOriginalPlay = message.embeds[0];

        if (prevSongs?.length > 0) {
            await message.edit({
                embeds: [
                    EmbedBuilder.from(EmbedOriginalPlay)
                        .setDescription(`<a:playing:983379915036585994> **| Reproduciendo en ${queue.textChannel.guild.name}**\n\n**Canción**\n[\`${song.name}\`](${song.url}) \`[${song.formattedDuration}]\`\n\n${status(queue)}`)
                ]
            });
            return true;
        }

        const ButtonsEnabled = [
            new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('mMResumen')
                    .setLabel('Reanudar')
                    .setDisabled(false)
                    .setEmoji('⏯️'),

                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('mMPause')
                    .setLabel('Pausar')
                    .setDisabled(false)
                    .setEmoji('⏸'),

                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('mMNext')
                    .setLabel('Siguiente')
                    .setDisabled(false)
                    .setEmoji('⏩'),

                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('mMAutoplay')
                    .setLabel('Autoplay')
                    .setDisabled(false)
                    .setEmoji('🔁'),
            ]),

            new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setCustomId('mMRepeatsong')
                    .setLabel('Canción')
                    .setDisabled(false)
                    .setEmoji('🔂'),

                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setCustomId('mMRepeatqueue')
                    .setLabel('Cola')
                    .setDisabled(false)
                    .setEmoji('🔁'),

                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('mMMezclar')
                    .setLabel('Mezclar')
                    .setDisabled(false)
                    .setEmoji('🔀'),

                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId('mMStop')
                    .setLabel('Detener')
                    .setDisabled(false)
                    .setEmoji('⏹️'),
            ])
        ];

        await message.edit({
            embeds: [
                EmbedBuilder.from(EmbedOriginalPlay)
                    .setTitle(`Música 24/7 en ${queue.textChannel.guild.name}`)
                    .setURL(process.env.DISCORD_SERVER_URL)
                    .setDescription(`<a:playing:983379915036585994> **| Reproduciendo en ${queue.textChannel.guild.name}**\n\n**Canción**\n[\`${song.name}\`](${song.url}) \`[${song.formattedDuration}]\`\n\n${status(queue)}`)
                    .setThumbnail(music.user.displayAvatarURL())
                    .setImage(song.thumbnail)
                    .setFields([
                        {
                            name: `Link del video`, value: `[Enlace Directo](${song.url})`, inline: true
                        },
                        {
                            name: `Soporte`, value: `[Enlace Directo](${process.env.DISCORD_SERVER_URL})`, inline: true
                        }
                    ])
                    .setFooter({ text: `Solicitado por: ${song.user.globalName}`, iconURL: song.user.displayAvatarURL() })
                    .setTimestamp()
            ],
            components: ButtonsEnabled
        });

        return true;

    } catch (e) {
        console.log(e);
        return false;
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////// funcion para actualizar la cola////////////////////////////////////////////////////////////////////
/**
 * 
 * @param {*} queue 
 */
async function UpdateQueueMessage(queue) {

    //console.log(queue);

    try {

        let data = await distubeDb.findOne({ serverId: queue.textChannel.guild.id });
        if (!data) return false;

        const channel = queue.textChannel.guild.channels.cache.get(data.channelId);
        if (!channel) return false;

        const message = await channel.messages.fetch(data.messageIdQueue).catch((e) => { });
        if (!message) return false;

        const EmbedOriginalQueue = message.embeds[0];

        let playlist = await queue.songs.slice(0, 10).map((song, index) => {
            return `\`${index + 1}\` [\`${song.name}\`](${song.url})`//__**${song.user.globalName}**__
        }).join('\n');

        await message.edit({
            embeds: [
                EmbedBuilder.from(EmbedOriginalQueue)
                    .setTitle(`${queue.songs.length} Canción(s) en cola`)
                    .setURL(process.env.DISCORD_SERVER_URL)
                    .setDescription(playlist)
                    .setFooter({ text: `Cola actual en ${queue.textChannel.guild.name}`, iconURL: `${queue.textChannel.guild.iconURL()}` })
            ]
        });

        return true;

    } catch (e) {
        console.log(e);
        return false;
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////// funcion para retornar al mensaje original/////////////////////////////////////////////////////////////
/**
 * 
 * @param {Client} music 
 * @param {*} queue 
 */
async function UpdateMusicMessage(queue, music) {

    try {

        let data = await distubeDb.findOne({ serverId: queue.textChannel.guild.id });
        if (!data) return false;

        const channel = queue.textChannel.guild.channels.cache.get(data.channelId);
        if (!channel) return false;

        const playMessage = await channel.messages.fetch(data.messageIdPlay).catch((e) => { });
        if (!playMessage) return false;

        const queueMessage = await channel.messages.fetch(data.messageIdQueue).catch((e) => { });
        if (!queueMessage) return false;

        const embedPlay = new EmbedBuilder()
            .setColor('Aqua')
            .setTitle(`Únase al canal de voz para reproducir una canción!`)
            .setImage(data.imageBanner)
            .setDescription(`>>> **No se está reproduciendo ninguna canción actualmente!**`) //\n\n[Soporte](${servidor.discord})
            .setFooter({ text: ` Utiliza /musica play para iniciar la reproducción!\nEscribe el nombre de la canción para reproducir!\nEnvia el enlace de una lista de reproducción!`, iconURL: `${music.user.displayAvatarURL()}` })

        const ButtonsDisabled = [
            new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('mMResumen')
                    .setLabel('Reanudar')
                    .setDisabled(true)
                    .setEmoji('⏯️'),

                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('mMPause')
                    .setLabel('Pausar')
                    .setDisabled(true)
                    .setEmoji('⏸'),

                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('mMNext')
                    .setLabel('Siguiente')
                    .setDisabled(true)
                    .setEmoji('⏩'),

                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('mMAutoplay')
                    .setLabel('Autoplay')
                    .setDisabled(true)
                    .setEmoji('🔁'),
            ]),

            new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setCustomId('mMRepeatsong')
                    .setLabel('Canción')
                    .setDisabled(true)
                    .setEmoji('🔂'),

                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setCustomId('mMRepeatqueue')
                    .setLabel('Cola')
                    .setDisabled(true)
                    .setEmoji('🔁'),

                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('mMMezclar')
                    .setLabel('Mezclar')
                    .setDisabled(true)
                    .setEmoji('🔁'),

                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId('mMStop')
                    .setLabel('Detener')
                    .setDisabled(true)
                    .setEmoji('⏹️'),
            ])
        ];

        await playMessage.edit({
            embeds: [embedPlay],
            components: ButtonsDisabled
        });

        const embedQueue = new EmbedBuilder()
            .setColor('Aqua')
            .setTitle(`Hay \`0\` canciones en Cola!`)

        await queueMessage.edit({
            embeds: [embedQueue]
        });

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
    UpdatePlayMessage,
    UpdateQueueMessage,
    UpdateMusicMessage
}