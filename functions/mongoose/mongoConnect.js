const { connect, set } = require('mongoose');
require('colors');

async function MongooseConnect() {
    try {
        set('strictQuery', false);
        const mongoApi = await connect(process.env.MONGO_SERVER_URI);
        console.log(` [MONGODB] :: Conectado a la base de datos ${mongoApi.connection.name} con éxito...`.cyan);
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    MongooseConnect
}