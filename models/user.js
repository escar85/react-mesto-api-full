const mongoose = require('mongoose');
const validator = require('validator');
const WrongCredentialsError = require('../middlewares/errors/wrong-credentials-error');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 30,
  },

  about: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 30,
  },

  avatar: {
    type: String,
    required: true,
    validate: {
       validator(v) {
       return validator.isURL(v)
      }
    }
  },

  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(v) {
        return validator.isEmail(v)
      }
    }
  },

  password: {
    type: String,
    required: true,
    minLength: 5,
    select: false
  }
})


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