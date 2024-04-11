const { model, Schema } = require('mongoose');

module.exports = model('Musics', new Schema({
    serverId: String,
    channelId: String,
    parentId: String,
    rolId: String,
    messageIdQueue: String,
    messageIdPlay: String,
    imageBanner: String
}, { versionKey: false }));