const { REST, Routes } = require('discord.js');
const { clientId, token } = require('../config.json');
require('colors');

const rest = new REST().setToken(token);

// Para comandos globales.
rest.put(Routes.applicationCommands(clientId), { body: [] })
    .then(() => console.log(' [Nicaina Music] :: Eliminados con éxito todos mis comandos globales.'.green))
    .catch((error) => {
        console.log(' [WARNING] :: '.red, error);
    });