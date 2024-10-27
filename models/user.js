const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');

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
  avatarURL: {
    type: String,
  },
  token: {
    type: String,
    default: null,
  },
});

userSchema.pre('save', function (next) {
  if (this.isNew) {
    this.avatarURL = gravatar.url(this.email, { s: '250', d: 'retro' }, true);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
