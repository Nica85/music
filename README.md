# Music Bot

Bot de música de la comunidad nicaina team.

### Instalar

------------
Para iniciar tienen que renombrar los archivos y agregar sus propios datos:

- **.env.example --> .env**
- **config.example.json --> config.json**

Luego instalan los paquetes con el siguiente comando:

- **npm i**

Pueden registar los comandos para 1 servidor o pueden hacerlo global, abren una terminal en la carpeta config y ahi pueden ejecutar según lo deseen:
***NOTA: Si lo hacen para 1 servidor tienen que invitar primero al bot, luego ejecutar el comando y por ultimo iniciarlo.***

**Servidor:**
```javascript
node registerGuildCommands.js
```

**Global:**
```javascript
node registerGlobalCommands.js
```

Pueden instalar pm2 para mantener en ejecución la aplicación:
- **npm i pm2@latest -g**

Luego ejecutan el comando desde la raiz del bot:
- **pm2 start ecosystem.config.js**

Para más información sobre **pm2** pueden visitar y leer la [documentación](https://pm2.keymetrics.io/docs/usage/quick-start/)

#### Cualquier otra duda pueden unirse a nuestro servidor:
[Discord](https://discord.gg/XhRMnh3KXZ)