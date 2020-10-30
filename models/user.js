const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const WrongCredentialsError = require('../middlewares/errors/wrong-credentials-error');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'Ваше имя',
    minLength: 2,
    maxLength: 30,
  },

  about: {
    type: String,
    required: true,
    default: 'О себе',
    minLength: 2,
    maxLength: 30,
  },

  avatar: {
    type: String,
    required: true,
    default: 'https://miro.medium.com/max/3600/1*HSisLuifMO6KbLfPOKtLow.jpeg',
    validate: {
      validator(v) {
        return validator.isURL(v);
      },
    },
  },

  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(v) {
        return validator.isEmail(v);
      },
    },
  },

  password: {
    type: String,
    required: true,
    select: false,
  },
});

// находим пользователя по email и проверяем пароль
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new WrongCredentialsError('Неверные почта или пароль'));
      }

      // bcrypt.compare сравнивает переданный пароль с хэшем пароля в базе
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new WrongCredentialsError('Неверные почта или пароль'));
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
