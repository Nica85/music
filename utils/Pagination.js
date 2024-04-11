const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ChatInputCommandInteraction, Message } = require('discord.js');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Si se proporciona solamente 1 embed la paginación no es visible, para que pueda verse se deben enviar más de 1 embed.
 * 
 * @param {ChatInputCommandInteraction} interaction La interacción del usuario.
 * @param {Array} pages Array de embeds para la paginación.
 * @param {Number} time El tiempo en milisegundos que dura la paginación, default 5 minutos (350_000 ms).
 * @returns {Promise<Message<boolean>>} 
 */
async function embedPagination(interaction, pages, time = 1000 * 60 * 5) {

    const { member } = interaction;

    if (!interaction) throw new Error('Por favor proporcione la interacción.');
    if (!pages) throw new Error('Por favor proporcione las paginas.');
    if (!Array.isArray(pages)) throw new Error('Las paginas tienen que ser un array.');
    if (typeof time !== 'number') throw new Error('El tiempo tiene que ser un numero.');
    if (parseInt(time) < 30000) throw new Error('El tiempo tiene que ser mayor a 30 segundos.');

    await interaction.deferReply();

    if (pages.length === 1) {
        const page = await interaction.editReply({
            content: '',
            embeds: pages,
            components: [],
            fetchReply: true,
        });
        return page;
    }

    const prev = new ButtonBuilder()
        .setCustomId('PaginationPrev')
        .setLabel('Anterior')
        .setEmoji('◀️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true)

    const home = new ButtonBuilder()
        .setCustomId('PaginationHome')
        .setLabel('Inicio')
        .setEmoji('🏠')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true)

    const next = new ButtonBuilder()
        .setCustomId('PaginationNext')
        .setLabel('Siguiente')
        .setEmoji('▶️')
        .setStyle(ButtonStyle.Success)
        .setDisabled(false)

    const butonsrow = new ActionRowBuilder().addComponents(prev, home, next);
    let index = 0;

    const currentpage = await interaction.editReply({
        content: `Pagina \`${index + 1} de ${pages.length} paginas\``,
        embeds: [pages[index]],
        components: [butonsrow],
        fetchReply: true,
    }).catch((e) => null);

    const collector = await currentpage.createMessageComponentCollector({
        ComponentType: ComponentType.Button,
        time,
    });

    collector.on('collect', async (i) => {

        if (i.user.id !== member.id) {
            return i.reply({ content: '❌ | Lo siento, no puedes utilizar estos botones!', ephemeral: true });
        }

        await i.deferUpdate();

        if (i.customId === 'PaginationPrev') {
            if (index > 0) {
                index--;
            }
        } else if (i.customId === 'PaginationHome') {
            index = 0;
        } else if (i.customId === 'PaginationNext') {
            if (index < pages.length - 1) {
                index++;
            }
        }

        if (index === 0) {
            prev.setDisabled(true);
        } else {
            prev.setDisabled(false);
        }

        if (index === 0) {
            home.setDisabled(true);
        } else {
            home.setDisabled(false);
        }

        if (index === pages.length - 1) {
            next.setDisabled(true);
        } else {
            next.setDisabled(false);
        }

        await currentpage.edit({
            content: `Pagina \`${index + 1} de ${pages.length} paginas\``,
            embeds: [pages[index]],
            components: [butonsrow],
        }).catch((e) => null);

        collector.resetTimer();

    });

    collector.on('end', async (r) => {

        await currentpage.edit({
            content: '❌ | Lo siento, se acabo el tiempo!',
            embeds: [],
            components: [],
            //embeds: [pages[index]],
            //components: [butonsrow],
        }).catch((e) => null);
    });

    return currentpage;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = {
    embedPagination
}