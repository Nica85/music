const { model, Schema } = require('mongoose');

module.exports = model('Playlists', new Schema({
    serverId: String,
    active: Boolean,
    userId: String,
    privacy: Boolean,
    name: String,
    songs: [{
        songId: String,
        url: String,
        name: String
    }]
    /*lists: [{
        name: String,
        listId: String,
        userName: String,
        userId: String,
        privacy: Boolean,
        songs: {
            url: [String],
            name: [String]
        }
    }]*/
}, { versionKey: false }));