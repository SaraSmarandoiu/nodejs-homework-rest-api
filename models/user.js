const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    subscription: {
        type: String,
        default: 'basic',
    },
    token: {
        type: String,
        default: null,
    },
    avatarURL: {
        type: String,
        default: '',
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
