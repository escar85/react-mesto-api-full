const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;
const WrongInputDataError = require('../middlewares/errors/wrong-input-data-error');
const WrongCredentialsError = require('../middlewares/errors/wrong-credentials-error');
const MongoError = require('../middlewares/errors/mongo-error');

const getUsers = (req, res, next) => {
  User.find({})
    .then((data) => res.send(data))
    .catch(next);
};

const getUserById = (req, res, next) => {
  User.findById(req.params.userId).orFail(new WrongInputDataError('Пользователь с таким id отсутствует'))
    .then((user) => res.send({ data: user }))
    .catch(next);
};

const createUser = (req, res, next) => {
  // bcrypt.hash хэшируем пароль, добавляем соль "10"
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash,
    }))
    .then((user) => {
      const newUser = user;
      newUser.password = '';
      res.send({ data: newUser });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new WrongInputDataError('Ошибка валидации. Проверьте введенные данные.');
      } else if (err.name === 'MongoError' || err.code === 11000) {
        throw new MongoError('Пользователь с таким E-Mail уже зарегистрирован');
      }
      throw new Error(err);
    })
    .catch(next);
};

const updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, {
    name: name,
    about: about
  }, {
    new: true,
    runValidators: true,
  })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new WrongInputDataError('Ошибка валидации. Проверьте введенные данные.');
      }
      throw new Error(err);
    })
    .catch(next);
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar: avatar }, {
    new: true,
    runValidators: true,
  })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new WrongInputDataError('Ошибка валидации. Проверьте введенные данные.');
      }
      throw new Error(err);
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создаем токен
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );

      res.send({ token });
    })
    .catch(next);
};

const getUserByToken = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization && !authorization.startsWith('Bearer ')) {
    throw new WrongCredentialsError('Необходима авторизация');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    throw new WrongCredentialsError('Необходима авторизация');
  }

  User.findById(payload).orFail(new WrongInputDataError('Пользователь с таким id отсутствует'))
    .then((user) => res.send({ data: user }))
    .catch(next);
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
  login,
  getUserByToken,
};
