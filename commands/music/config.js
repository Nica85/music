const { ChatInputCommandInteraction, EmbedBuilder, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const distubeDb = require('../../models/Distube');

module.exports = {
    name: 'music',
    description: 'configura el sistema de música',
    userPerms: ['Administrator'],
    botPerms: ['Administrator'],
    category: 'music',
    options: [
        {
            name: 'crear',
            description: 'configura el sistema de música',
            type: 1,
            options: [
                {
                    name: 'opciones',
                    description: 'selecciona una de las opciones',
                    type: 3,
                    required: true,
                    choices: [
                        {
                            name: 'voz',
                            value: '2'
                        },
                        {
                            name: 'texto',
                            value: '0'
                        }
                    ]
                },
                {
                    name: 'parent',
                    description: 'proporciona una categoría para el nuevo canal',
                    type: 7,
                    required: true,
                    channelTypes: [4]
                },
                {
                    name: 'nombre',
                    description: 'proporciona un nombre al nuevo canal',
                    type: 3,
                    required: true,
                    minLength: 1,
                    maxLength: 25,
                },
                {
                    name: 'rol',
                    description: 'proporciona el rol que tendrá acceso al nuevo canal',
                    type: 8,
                    required: false
                }
            ]
        },
        {
            name: 'desactivar',
            description: 'desactiva el sistema de musica',
            type: 1
        }
    ],

    /**
     *
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Client} music 
     */
    async execute(interaction, music) {

        const { guild, options } = interaction;
        const subCommands = options.getSubcommand();

        switch (subCommands) {

            case 'crear': {

                const parent = options.getChannel('parent');
                const role = options.getRole('rol');
                const name = options.getString('nombre');
                const choices = options.getString('opciones');
                const musicData = await distubeDb.findOne({ serverId: guild.id });

                if (musicData) {
                    await interaction.reply({ content: '⚠️ | Lo siento, el sistema de música ya esta configurado!\n\nPrimero desactívalo y configúralo de nuevo!', ephemeral: true });
                    return false;
                }

                if (role && role.name.includes('everyone') || role && role.managed) {
                    await interaction.reply({ content: '⚠️ | Lo siento, el rol no es gestionable!', ephemeral: true });
                    return false;
                }

                const embedQueue = new EmbedBuilder()
                    .setColor('Aqua')
                    .setTitle('Hay \`0\` canciones en Cola!')

                const embedPlay = new EmbedBuilder()
                    .setColor('Aqua')
                    .setTitle('Únase al canal de voz para reproducir una canción!')
                    .setImage('https://nicainateam.com/comunidad/nicaina.png')
                    .setDescription(`>>> No se está reproduciendo ninguna canción actualmente!\n\n[Soporte](${process.env.DISCORD_SERVER_URL})`) //\n\n[Soporte](${config.servidor.discord})
                    .setFooter({ text: `Utiliza /music play para iniciar la reproducción!\nEscribe el nombre de la canción para reproducir!\nEnvía el enlace de una lista de reproducción!`, iconURL: music.user.displayAvatarURL() })

                const Buttons = [
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
                            .setEmoji('🔀'),

                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId('mMStop')
                            .setLabel('Detener')
                            .setDisabled(true)
                            .setEmoji('⏹️'),
                    ])
                ];

                let permissionOverwrites = [];
                if (role) {
                    permissionOverwrites = [
                        {
                            id: guild.id,
                            deny: ['ViewChannel']
                        },
                        {
                            id: role.id,
                            allow: ['ViewChannel', 'Connect', 'ReadMessageHistory', 'SendMessages'],
                            deny: ['MentionEveryone']
                        }
                    ];
                } else {
                    permissionOverwrites = [
                        {
                            id: guild.id,
                            deny: ['ViewChannel']
                        }
                    ];
                }

                await interaction.deferReply({ ephemeral: true });

                try {

                    const channel = await guild.channels.create({
                        name: name,
                        type: Number(choices),
                        parent: parent.id,
                        permissionOverwrites: permissionOverwrites
                    });

                    const messageQueue = await channel.send({ embeds: [embedQueue] });
                    const messagePlay = await channel.send({ embeds: [embedPlay], components: Buttons });

                    await distubeDb.create({
                        serverId: guild.id,
                        channelId: channel.id,
                        parentId: parent.id,
                        rolId: role?.id || '',
                        messageIdQueue: messageQueue.id,
                        messageIdPlay: messagePlay.id,
                        imageBanner: 'https://nicainateam.com/comunidad/nicaina.png'
                    });

                    await interaction.followUp({
                        content: role ?
                            `✅ | Configurado con éxito el sistema de música, ahora los comandos solo podrán enviarse en ${channel} y el rol permitido es ${role}`
                            :
                            `✅ | Configurado con éxito el sistema de música, ahora los comandos solo podrán enviarse en ${channel}`
                    });

                } catch (e) {
                    console.log(e);
                    await interaction.followUp({ content: '❌ | Lo siento, ocurrió un error al ejecutar el comando!' });
                    return false;
                }
            }
                break;

            case 'desactivar': {

                const musicData = await distubeDb.findOne({ serverId: guild.id });

                if (!musicData) {
                    await interaction.reply({ content: '⚠️ | Lo siento, el sistema de música no esta configurado!', ephemeral: true });
                    return false;
                }

                const channel = guild.channels.cache.get(musicData.channelId);

                if (!channel) {
                    await musicData.deleteOne();
                    await interaction.reply({ content: '✅ | Sistema de música desactivado con éxito!', ephemeral: true });
                    return true;
                }

                await interaction.deferReply({ ephemeral: true });

                try {

                    await channel.delete().catch((e) => { });
                    await musicData.deleteOne();

                    await interaction.followUp({ content: '✅ | Sistema de música desactivado con éxito!' });

                } catch (e) {
                    console.log(e);
                    await interaction.followUp({ content: '❌ | Lo siento, ocurrió un error al ejecutar el comando!' });
                    return false;
                }
            }
                break;
        }
    }
}