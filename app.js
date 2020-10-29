require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { celebrate, Joi, errors } = require('celebrate');
const cors = require('cors');

const router = require('./routes');
const { login, createUser, getUserByToken } = require('./controllers/users');
const notFoundError = require('./middlewares/errors/not-found-error');

const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});

app.use(cors());

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
});

app.use(express.json());

app.use(requestLogger);

// жуткая вещь, нужно будет убрать потом
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

// незащищеные маршруты
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(7)
  })
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(7)
  })
}), createUser);

// миддлвэр авторизации
app.use(auth);

// защищенные маршруты
app.get('/users/me', getUserByToken);
app.use(router);

app.all('*', (req, res, next) => {
  next(new notFoundError('Запрашиваемый ресурс не найден'))
});

app.use(errorLogger);

// обработчик ошибок celebrate
app.use(errors());

// централизованная обработка ошибок. принимает на вход аргумент-ошибку со статусом и сообщением
app.use((err, req, res, next) => {

  // если статус не пришел, выставляем по умолчанию ошибку сервера
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message
    });
});