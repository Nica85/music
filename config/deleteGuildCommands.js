const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('../config.json');
require('colors');

const rest = new REST().setToken(token);

// for guild-based commands
rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
    .then(() => console.log(` [Nicaina Music] :: Eliminados con éxito todos mis comandos del servidor ${guildId}.`.green))
    .catch((error) => {
        console.log(' [WARNING] :: '.red, error);
    });