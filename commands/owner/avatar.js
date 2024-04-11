const { ChatInputCommandInteraction, Client } = require('discord.js');

module.exports = {
    name: 'avatar',
    description: 'cambia el avatar del bot',
    userPerms: ['Administrator'],
    botPerms: ['Administrator'],
    category: 'owner',
    options: [
        {
            name: 'imagen',
            description: 'proporciona la url del avatar',
            type: 3,
            required: true
        }
    ],
    owner: true,

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Client} music 
     */
    async execute(interaction, music) {

        const { options, member } = interaction;

        if (member.id !== process.env.DISCORD_OWNER_ID) {
            await interaction.reply({ content: '⚠️ | Lo siento, este comando solamente lo puede utilizar [Nica]!', ephemeral: true });
            return false;
        }

        await interaction.deferReply({ ephemeral: true });

        try {

            const imgUrl = options.getString('imagen');
            await music.user.setAvatar(imgUrl);

            await interaction.followUp({ content: '✅ | Avatar actualizado con exito!', ephemeral: true });
            return true;

        } catch (e) {
            console.log(e);
            await interaction.followUp({ content: '⚠️ | Lo siento, ocurrió un error al ejecutar el comando!' });
            return false;
        }
    }
}