const express = require('express');
const mongoose = require('mongoose');
const { celebrate, Joi, errors } = require('celebrate');

const router = require('./routes');
const { login, createUser } = require('./controllers/users');

const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});

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
    password: Joi.string().required().min(7),
    name: Joi.string().required().min(2).max(30).empty('').default('Имя'),
    about: Joi.string().required().min(2).max(30).empty('').default('О себе'),
    avatar: Joi.string().required().domain().empty('').default('https://miro.medium.com/max/3600/1*HSisLuifMO6KbLfPOKtLow.jpeg')
  })
}), createUser);

// миддлвэр авторизации
app.use(auth);

// защищенные маршруты
app.use(router);


app.all('*', (req, res) => {
  res.status(404).send({ message: '«Запрашиваемый ресурс не найден»' });
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




// NOT A SUPER-SECRET-KEY f385894f20935f1d2fbeae7c08149367c7c867633e149850056bc3e1149695a1