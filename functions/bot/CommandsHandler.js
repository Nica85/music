const { Client } = require('discord.js');
const Permissions = require('../../utils/Permissions');
const Evetns = require('../../utils/Events');
const fs = require('node:fs');
const path = require('node:path');
require('colors');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 
 * @param {Client} music 
 */
function LoadHandlers(music) {

    const handlerPath = path.join(__dirname, '../../handlers');
    const handlerFiles = fs.readdirSync(handlerPath).filter(file => file.endsWith('.js'));

    for (const file of handlerFiles) {
        const filePath = path.join(handlerPath, file);
        require(filePath)(music);
    }

    console.log(` [Nicaina Music] :: (+) ${handlerFiles.length} Handlers cargados...`.blue);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 
 * @param {Client} music 
 */
function LoadCommandsClient(music) {

    let totalCommands = 0;

    const categories = path.join(__dirname, '../../commands');
    music.categories = fs.readdirSync(categories);

    const foldersPath = path.join(__dirname, '../../commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            if (!command.name) {
                console.log(` [Nicaina Music] :: (-) Comando sin nombre en ${file}...`.red);
                continue;
            }

            if (!command.context && !command.description) {
                console.log(` [Nicaina Music] :: (-) Comando ${command.name} sin descripción...`.red);
                continue;
            }

            if (command.userPerms) {
                if (command.userPerms.every(perms => Permissions.includes(perms))) {
                    command.default_member_permissions = false;
                } else {
                    console.log(` [Nicaina Music] :: (-) Permisos de usuario invalidos en el comando ${command.name}...`.red);
                    continue;
                }
            }

            // Establezca un nuevo elemento en la Colección con la clave como nombre del comando y el valor como módulo exportado
            if ('execute' in command) {
                music.commands.set(command.name, command);
                totalCommands++;
            } else {
                console.log(` [WARNING] :: El comando en ${filePath} le falta la propiedad requerida 'execute'.`);
            }
        }
    }

    console.log(` [Nicaina Music] :: (+) ${totalCommands} Comandos cargados con exito...`.blue);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 
 * @param {Client} music 
 */
function LoadEvents(music) {

    let totalEvents = 0;

    const foldersPath = path.join(__dirname, '../../events');
    const eventsfolder = fs.readdirSync(foldersPath);

    for (const folder of eventsfolder) {

        const eventsPath = path.join(foldersPath, folder);
        const eventsFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventsFiles) {

            const filePath = path.join(eventsPath, file);
            const event = require(filePath);

            if (!Evetns.includes(event.name) || !event.name) {
                console.log(` [WARNING] :: (-) ${event.name || 'Falta'} El nombre del evento no es valido o no éxiste en ${file}...`.red);
                continue;
            }

            const execute = (...args) => event.execute(...args, music);
            music.events.set(event.name, execute);
            totalEvents++;

            if (event.rest) {
                if (event.once) {
                    music.rest.once(event.name, execute);
                } else {
                    music.rest.on(event.name, execute);
                }
            } else {
                if (event.once) {
                    music.once(event.name, execute);
                } else {
                    music.on(event.name, execute);
                }
            }
        }
    }

    console.log(` [Nicaina Music] :: (+) ${totalEvents} Eventos cargados...`.green);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = {
    LoadEvents,
    LoadHandlers,
    LoadCommandsClient
}