const { ChatInputCommandInteraction, EmbedBuilder, Client } = require('discord.js');
const { embedPagination } = require('../../utils/Pagination');
const { CustomIds, DelayTime } = require('../../utils/others');
const distubeDb = require('../../models/Distube');
const playlistDb = require('../../models/PlayList');

module.exports = {
    name: 'playlist',
    description: 'lista de reproducción perzonalizada',
    botPerms: ['Administrator'],
    category: 'music',
    options: [
        {
            name: 'crear',
            description: 'crea una nueva lista de reproducción',
            type: 1,
            options: [
                {
                    name: 'nombre',
                    description: 'proporciona un nombre a la lista de reproducción',
                    type: 3,
                    required: true
                }
            ]
        },
        {
            name: 'privacidad',
            description: 'cambia la privacidad de la lista de reproducción',
            type: 1,
            options: [
                {
                    name: 'id',
                    description: 'proporciona la id de la playlist',
                    type: 3,
                    required: true
                },
                {
                    name: 'opciones',
                    description: 'selecciona una opción',
                    type: 3,
                    required: true,
                    choices: [
                        {
                            name: 'publica',
                            value: 'public'
                        },
                        {
                            name: 'privada',
                            value: 'private'
                        }
                    ]
                }
            ]
        },
        {
            name: 'agregar',
            description: 'agrega una nueva canción a la lista',
            type: 1,
            options: [
                {
                    name: 'playlist',
                    description: 'proporciona la id de la playlist',
                    type: 3,
                    required: true
                },
                {
                    name: 'cancion',
                    description: 'proporciona el nombre de una canción',
                    type: 3,
                    required: true
                }
            ]
        },
        {
            name: 'remover',
            description: 'remueve una canción de una playlist',
            type: 1,
            options: [
                {
                    name: 'playlist',
                    description: 'proporciona la id de una playlist',
                    type: 3,
                    required: true
                },
                {
                    name: 'cancion',
                    description: 'proporciona el id de una canción a remover',
                    type: 3,
                    required: true
                }
            ]
        },
        {
            name: 'eliminar',
            description: 'elimana una lista de reproducción existente',
            type: 1,
            options: [
                {
                    name: 'playlist',
                    description: 'proporciona la id de una playlist',
                    type: 3,
                    required: true
                }
            ]
        },
        {
            name: 'listas',
            description: 'listas de todas las playlist activas',
            type: 1,
            options: [
                {
                    name: 'opciones',
                    description: 'selecciona un opción',
                    type: 3,
                    required: true,
                    choices: [
                        {
                            name: 'publicas',
                            value: 'public'
                        },
                        {
                            name: 'privadas',
                            value: 'private'
                        }
                    ]
                }
            ]
        },
        {
            name: 'informacion',
            description: 'ver la información de una playlist',
            type: 1,
            options: [
                {
                    name: 'playlist',
                    description: 'proporciona la id de una playlist',
                    type: 3,
                    required: true
                }
            ]
        },
        {
            name: 'reproducir',
            description: 'reproduce una lista de reproducción',
            type: 1,
            options: [
                {
                    name: 'playlist',
                    description: 'proporciona la id de una lista de reproducción',
                    type: 3,
                    required: true
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
        const subCommands = options.getSubcommand();

        const musicData = await distubeDb.findOne({ serverId: guild.id });

        if (!musicData) {
            await interaction.reply({ content: '⚠️ | Lo siento, el sistema de música aun no se ha activado!', ephemeral: true });
            return false;
        }

        if (!musicData?.channelId) {
            await interaction.reply({ content: '⚠️ | Lo siento, el sistema de música esta desactivado!', ephemeral: true });
            return false;
        }

        if (musicData.channelId && musicData.channelId !== channel.id) {
            await interaction.reply({ content: `⚠️ | Lo siento, este comando solo puedes utilizarlo en el canal <#${musicData.channelId}>`, ephemeral: true });
            return false;
        }

        switch (subCommands) {

            case 'crear': {

                const name = options.getString('nombre').toLowerCase();

                const playlistData = await playlistDb.find().then((s) => {
                    return s?.filter((s) => s?.serverId === guild.id && s?.userId === member.id);
                });

                if (playlistData?.length >= 10) {
                    await interaction.reply({ content: '⚠️ | Lo siento, no puedes tener más de 10 listas de reproducción!', ephemeral: true });
                    return false;
                }

                await playlistDb.create({ serverId: guild.id, userId: member.id, active: true, privacy: true, name: name, songs: [] });

                await interaction.reply({
                    content: `✅ | Lista de reproducción \`${name}\` creada con éxito!\n\nUtiliza \`/playlist lista\` para ver la ID  de la lista!\nUtiliza \`/playlist privacidad\` para cambiar la privacidad de la lista!\nUtiliza \`/playlist agregar\` para agregar nuevas canciones!`,
                    ephemeral: true
                });
            }
                break;

            case 'privacidad': {

                const listId = options.getString('id');
                const choices = options.getString('opciones');
                const listInfo = await playlistDb.findOne({ _id: listId });

                if (!listInfo) {
                    await interaction.reply({ content: '⚠️ | Lo siento, la id proporcionada no es valida!', ephemeral: true });
                    return false;
                }

                if (member.id !== listInfo.userId) {
                    await interaction.reply({ content: '⚠️ | Lo siento, no puedes cambiar una lista que no sea tuya!', ephemeral: true });
                    return false;
                }

                switch (choices) {

                    case 'public': {

                        if (!listInfo.privacy) {
                            await interaction.reply({ content: '⚠️ | Lo siento, la lista ya es publica!', ephemeral: true });
                            return false;
                        }

                        listInfo.privacy = false;
                        await listInfo.save();

                        await interaction.reply({ content: `✅ | Lista de reproducción configurada como \`publica!\``, ephemeral: true });
                    }
                        break;

                    case 'private': {

                        if (listInfo.privacy) {
                            await interaction.reply({ content: '⚠️ | Lo siento, la lista ya es privada!', ephemeral: true });
                            return false;
                        }

                        listInfo.privacy = true;
                        await listInfo.save();

                        await interaction.reply({ content: `✅ | Lista de reproducción configurada como \`privada!\``, ephemeral: true });
                    }
                        break;
                }
            }
                break;

            case 'listas': {

                const choices = options.getString('opciones');

                switch (choices) {

                    case 'public': {

                        const listsPublic = await playlistDb.find().then((s) => {
                            return s?.filter((s) => s?.serverId === guild.id && s?.privacy === false);
                        });

                        if (!listsPublic?.length) {
                            await interaction.reply({ content: '⚠️ | Lo siento, no hay listas publicas en este momento!', ephemeral: true });
                            return false;
                        }

                        //let index = 1;
                        const lists = listsPublic.map((x, i) => {
                            return `Lista nº\`${i + 1}\`\nID: \`${x.id}\`\nNombre: ${x.name}\nCanciones: ${x.songs.map((x) => x.name).join(', ')}`;
                        });

                        await interaction.reply({ content: '<a:datos_bot:983474634097848400> Espera un momento estoy obteniendo los datos!' });

                        try {

                            let embedsListMusic = [];
                            let elements = 5; //cantidad de usuarios en la descripcion del embed
                            let divider = elements; //elementos divididos
                            for (let i = 0; i < lists.length; i += divider) {
                                const descrip = lists.slice(i, elements).join('\n');
                                elements += divider;

                                const embed = new EmbedBuilder()
                                    .setColor('Random')
                                    .setTitle(`📚 Listas de reproducción publicas en ${guild.name}`)
                                    .setDescription(descrip)
                                    .setTimestamp()
                                if (guild?.iconURL) {
                                    embed.setThumbnail(guild.iconURL())
                                    embed.setFooter({ text: guild.name, iconURL: guild.iconURL() })
                                } else {
                                    embed.setFooter({ text: guild.name })
                                }

                                embedsListMusic.push(embed);
                            }

                            await DelayTime(2000);
                            await embedPagination(interaction, embedsListMusic);

                        } catch (e) {
                            console.log(e);
                            await interaction.editReply({ content: '⚠️ | Lo siento, ocurrió un error al ejecutar el comando!' });
                            return false;
                        }
                    }
                        break;

                    case 'private': {

                        const listsPriv = await playlistDb.find().then((s) => {
                            return s?.filter((s) => s?.serverId === guild.id && s?.privacy === true && s?.userId === member.id);
                        });

                        if (!listsPriv?.length) {
                            await interaction.reply({ content: '⚠️ | Lo siento, no tienes listas privadas en este momento!', ephemeral: true });
                            return false;
                        }

                        const lists = listsPriv.map((x, i) => {
                            return `Lista nº\`${i + 1}\`\nID: \`${x.id}\`\nNombre: ${x.name}\nCanciones: ${x.songs.map((x) => x.name).join(', ')}`;
                        });

                        await interaction.reply({ content: '<a:datos_bot:983474634097848400> Espera un momento estoy obteniendo los datos!' });

                        try {

                            let embedsListMusic = [];
                            let elements = 5; //cantidad de usuarios en la descripcion del embed
                            let divider = elements; //elementos divididos
                            for (let i = 0; i < lists.length; i += divider) {
                                const descrip = lists.slice(i, elements).join('\n');
                                elements += divider;

                                const embed = new EmbedBuilder()
                                    .setColor('Random')
                                    .setTitle('📚 Tus listas de reproducciones!')
                                    .setDescription(descrip)
                                    .setTimestamp()
                                if (guild?.iconURL) {
                                    embed.setThumbnail(guild.iconURL())
                                    embed.setFooter({ text: guild.name, iconURL: guild.iconURL() })
                                } else {
                                    embed.setFooter({ text: guild.name })
                                }

                                embedsListMusic.push(embed);
                            }

                            await DelayTime(2000);
                            await embedPagination(interaction, embedsListMusic);

                        } catch (e) {
                            console.log(e);
                            await interaction.editReply({ content: '⚠️ | Lo siento, ocurrió un error al ejecutar el comando!' });
                            return false;
                        }
                    }
                        break;
                }
            }
                break;

            case 'informacion': {

                const listId = options.getString('playlist');
                const listInfo = await playlistDb.findOne({ _id: listId });

                if (!listInfo) {
                    await interaction.reply({ content: '⚠️ | Lo siento, la id proporciona no es valida!', ephemeral: true });
                    return false;
                }

                let privacy = '';
                if (listInfo.privacy) {
                    privacy = 'Privada'
                } else {
                    privacy = 'Publica'
                }

                //const songNames = listInfo.songs.name;
                const songs = listInfo.songs.map((x, i) => {
                    return `**${i + 1}.** \`${x.name}\``;
                }).join('\n');

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Random')
                            .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
                            .setTitle(`Información de ${listInfo.name}`)
                            .setDescription(`**Nombre:** ${listInfo.name}\n**ID:** \`${listId}\`\n**Creador:** <@${listInfo.userId}>\n**Privacidad:** ${privacy}\n\n**Canciones:**\n${songs}`)
                            .setTimestamp()
                    ]
                });
            }
                break;

            case 'agregar': {

                const listId = options.getString('playlist');
                const song = options.getString('cancion');
                const listInfo = await playlistDb.findOne({ _id: listId });

                if (!listInfo) {
                    await interaction.reply({ content: '⚠️ | Lo siento, la id proporciona no es valida!', ephemeral: true });
                    return false;
                }

                if (listInfo.songs.length >= 20) {
                    await interaction.reply({ content: '⚠️ | Lo siento, no puedes tener más de 20 canciones en la lista!', ephemeral: true });
                    return false;
                }

                if (member.id !== listInfo.userId) {
                    await interaction.reply({ content: '⚠️ | Lo siento, no puedes agregar canciones a una lista que no es tuya!', ephemeral: true });
                    return false;
                }

                await interaction.deferReply({ ephemeral: true });

                try {

                    const data = await music.distube.search(song, { limit: 1 }).catch((e) => { });

                    if (!data) {
                        await interaction.followUp({ content: '⚠️ | Lo siento, la canción que intentas buscar no es valida!' });
                        return false;
                    }

                    const url = data[0].url;
                    const name = data[0].name;

                    if (listInfo.songs.find((x) => x.url === url)) {
                        await interaction.followUp({ content: '⚠️ | Lo siento, la canción que intentas agregar ya esta en la lista!' });
                        return false;
                    }

                    listInfo.songs.push({ name: name, url: url, songId: CustomIds() });
                    await listInfo.save();

                    await interaction.followUp({ content: `✅ | Agregada con éxito la canción [${name}](${url}) a la lista!\n\n Utiliza \`/playlist informacion\` para ver la lista de reproducción!` });

                } catch (e) {
                    console.log(e);
                    await interaction.followUp({ content: '⚠️ | Lo siento, ocurrió un error al ejecutar el comando!' });
                    return false;
                }
            }
                break;

            case 'remover': {

                const listId = options.getString('playlist');
                const songId = options.getString('cancion');
                const listInfo = await playlistDb.findOne({ _id: listId });

                if (!listInfo) {
                    await interaction.reply({ content: '⚠️ | Lo siento, la id de la lista proporciona no es valida!', ephemeral: true });
                    return false;
                }

                if (member.id !== listInfo.userId) {
                    await interaction.reply({ content: '⚠️ | Lo siento, no puedes agregar canciones a una lista que no es tuya!', ephemeral: true });
                    return false;
                }

                if (!listInfo.songs.find((x) => x.songId === songId)) {
                    await interaction.reply({ content: '⚠️ | Lo siento, la id de la canción proporcionada no es valida!', ephemeral: true });
                    return false;
                }

                listInfo.songs = listInfo.songs.filter((x) => x.songId !== songId);
                await listInfo.save();

                await interaction.reply({ content: '✅ | Removida con éxito la canción de la lista!', ephemeral: true });
            }
                break;

            case 'eliminar': {

                const listId = options.getString('playlist');
                const listInfo = await playlistDb.findOne({ _id: listId });

                if (!listInfo) {
                    await interaction.reply({ content: '⚠️ | Lo siento, la id proporciona no es Valida!', ephemeral: true });
                    return false;
                }

                if (member.id !== listInfo.userId) {
                    await interaction.reply({ content: '⚠️ | Lo siento, no puedes eliminar una lista que no sea tuya!', ephemeral: true });
                    return false;
                }

                await listInfo.deleteOne();

                await interaction.reply({ content: `✅ | Eliminada con éxito la lista \`${listId}\``, ephemeral: true });
            }
                break;

            case 'reproducir': {

                const voiceChannel = member?.voice?.channel;
                const listId = options.getString('playlist');
                const listInfo = await playlistDb.findOne({ _id: listId });

                await interaction.deferReply({ ephemeral: true });

                try {

                    if (!voiceChannel) {
                        await interaction.followUp({ content: '⚠️ | Lo siento, únete a un canal de voz para utilizar el comando!' });
                        return false;
                    }

                    if (guild.members.me?.voice?.channel && voiceChannel.id !== guild.members.me.voice.channel.id) {
                        await interaction.followUp({ content: '⚠️ | Lo siento, necesitas estar en el mismo canal que yo!' });
                        return false;
                    }

                    if (!listInfo) {
                        await interaction.followUp({ content: '⚠️ | Lo siento, la id proporcionada no es valida!' });
                        return false;
                    }

                    if (listInfo.privacy) {

                        if (listInfo.userId !== member.id) {
                            await interaction.followUp({ content: `⚠️ | Lo siento, esta es una lista privada de <@${listInfo.userId}>` });
                            return false;
                        }

                        if (!listInfo.songs?.length) {
                            await interaction.followUp({ content: `⚠️ | Lo siento, primero agrega canciones a la lista de reproducción!\n\nUtiliza el comando \`/playlist agregar\` para hacerlo!` });
                            return false;
                        }

                        const songs = listInfo.songs.map((x) => x.url); // Tiene que ser una array de strings [string]

                        const list = await music.distube.createCustomPlaylist(songs, {
                            member: member,
                            properties: { name: listInfo.name },
                            parallel: true
                        });

                        await music.distube.play(voiceChannel, list, { textChannel: channel, member: member });

                        await interaction.followUp({ content: '✅ | Solicitud recibida, iniciare la reproducción en breve!' });
                        return true;
                    }

                    if (!listInfo.songs?.length) {
                        await interaction.followUp({ content: `⚠️ | Primero agrega canciones a la lista de reproducción!\n\nUtiliza el comando \`/playlist agregar\` para hacerlo!` });
                        return false;
                    }

                    const songs = listInfo.songs.map((x) => x.url); // Tiene que ser una array de strings [string]

                    const list = await music.distube.createCustomPlaylist(songs, {
                        member: member,
                        properties: { name: listInfo.name },
                        parallel: true
                    });

                    await music.distube.play(voiceChannel, list, { textChannel: channel, member: member });

                    await interaction.followUp({ content: '✅ | Solicitud recibida, iniciare la reproducción en breve!' });

                } catch (e) {
                    console.log(e);
                    await interaction.followUp({ content: '⚠️ | Lo siento, ocurrió un error al ejecutar el comando!' });
                    return false;
                }
            }
                break;
        }
    }
}