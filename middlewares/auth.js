const jwt = require('jsonwebtoken');
const { NODE_ENV, JWT_SECRET } = process.env;
const WrongCredentialsError = require('./errors/wrong-credentials-error');

const auth = (req, res, next) => {

  try {
  // заголовок авторизации
  const { authorization } = req.headers;
  // если загаловка нет или он не начинается с "Bearer" - вернем ошибку авторизации
  if (!authorization && !authorization.startsWith('Bearer ')) {
    throw new WrongCredentialsError('Необходима аторизация')
  }

  // извлекаем токен
  const token = authorization.replace('Bearer ', '');
  let payload;

  // верифицируем токен с помощью метода "verify" и обрабатываем ошибку
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    throw new WrongCredentialsError('Необходима аторизация')
  }
  req.user = payload
} catch (err) { throw new WrongCredentialsError('Необходима аторизация') }

  next();
}

module.exports = auth;