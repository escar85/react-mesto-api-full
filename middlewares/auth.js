const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

  // заголовок авторизации
  const { authorization } = req.headers;

  // если загаловка нет или он не начинается с "Bearer" - вернем ошибку авторизации
  if (!authorization && !authorization.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Необходима авторизация' });
  }

  // извлекаем токен
  const token = authorization.replace('Bearer ', '');
  let payload;

  // верифицируем токен с помощью метода "verify" и обрабатываем ошибку
  try {
    payload = jwt.verify(token, 'f385894f20935f1d2fbeae7c08149367c7c867633e149850056bc3e1149695a1');
  } catch (err) {
    return res.status(401).send({ message: 'Необходима авторизация' });
  }


  req.user = payload;

  next();
}