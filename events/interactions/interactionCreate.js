const { CommandInteraction, Client, InteractionType, Events } = require('discord.js');
const { ApplicationCommand } = InteractionType;

module.exports = {
    name: Events.InteractionCreate,
    on: true,

    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} music 
     */
    async execute(interaction, music) {

        const { user, guild, commandName, member, type } = interaction;

        if (!guild) return;
        if (user?.bot) return;
        if (type !== ApplicationCommand) return;

        const command = music.commands.get(commandName);

        if (!command) {
            await interaction.reply({ content: '⚠️ | Lo siento, este comando no éxiste!', ephemeral: true });
            return false;
        }

        if (command.userPerms && command.userPerms.length !== 0) {
            if (!member.permissions.has(command.userPerms)) {
                await interaction.reply({ content: `⚠️ | Necesitas \`${command.userPerms.join(', ')}\` para ejecutar este comando!`, ephemeral: true });
                return false;
            }
        }

        if (command.botPerms && command.botPerms.length !== 0) {
            if (!guild.members.me.permissions.has(command.botPerms)) {
                await interaction.reply({ content: `⚠️ | Necesito \`${command.botPerms.join(', ')}\` para ejecutar este comando!`, ephemeral: true });
                return false;
            }
        }

        command.execute(interaction, music);
    }
}