const express = require('express');
const mongoose = require('mongoose');
const { celebrate, Joi, errors } = require('celebrate');
const cors = require('cors');

const router = require('./routes');
const { login, createUser, getUserByToken } = require('./controllers/users');

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

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", '*');
//   res.header("Access-Control-Allow-Credentials", true);
//   res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS');
//   res.header("Access-Control-Allow-Headers", 'Origin, Access-Control-Allow-Origin, Authorization, X-Requested-With, Content-Type, Accept, content-type, application/json');
//   next();
// });

app.use(express.json());

app.use(requestLogger);

// жуткая вещь, нужно будет убрать потом
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

// незащищеные маршруты
app.post('/sign-in', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(7)
  })
}), login);

app.post('/sign-up', celebrate({
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