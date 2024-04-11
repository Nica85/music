const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('../config.json');
const Permissions = require('../utils/Permissions');
const fs = require('node:fs');
const path = require('node:path');
require('colors');

const commands = [];
// Tome todas las carpetas de comandos del directorio de comandos que creó anteriormente
const foldersPath = path.join(__dirname, '../commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    // Tome todos los archivos de comandos del directorio de comandos que creó anteriormente
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    // Tome la salida de los datos de cada comando para su implementación
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if (!command.name) {
            console.log(` [WARNING] :: (-) Comando sin nombre en ${file}...`.red);
            continue;
        }

        if (!command.context && !command.description) {
            console.log(` [WARNING] :: (-) Comando ${command.name} sin descripción...`.red);
            continue;
        }

        if (command.userPerms) {
            if (command.userPerms.every(perms => Permissions.includes(perms))) {
                command.default_member_permissions = false;
            } else {
                console.log(` [WARNING] :: (-) Permisos de usuario invalidos en el comando ${command.name}...`.red);
                continue;
            }
        }

        if ('execute' in command) {
            commands.push(command);
        } else {
            console.log(` [WARNING] :: El comando en ${filePath} le falta la propiedad requerida 'execute'.`.red);
        }
    }
}

// Construir y preparar una instancia del módulo REST.
const rest = new REST().setToken(token);

// ¡Y despliega tus comandos!
(async () => {
    try {
        console.log(` [Nicaina Music] :: Actualizando ${commands.length} application (/) commands en el servidor ${guildId}.`.cyan);

        // El método put se utiliza para actualizar completamente todos los comandos del gremio con el conjunto actual
        const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });

        console.log(` [Nicaina Music] :: Recargados con éxito ${data.length} application (/) commands en el servidor ${guildId}.`.green);
    } catch (error) {
        // Y, por supuesto, ¡asegúrese de detectar y registrar cualquier error!
        console.log(' [WARNING] :: '.red, error);
    }
})();