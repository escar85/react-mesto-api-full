const usersRouter = require('express').Router();
const { getUsers, getUserById, updateProfile, updateAvatar } = require('../controllers/users');
const { celebrate, Joi } = require('celebrate');
const { isUrl } = require('validator');

usersRouter.get('/users', getUsers);

usersRouter.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().hex().length(24)
  }),
}), getUserById);

usersRouter.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30)
  })
}), updateProfile);

usersRouter.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom((value, helpers) => {
      if(!isUrl(value)) return helpers.error('Невалидная ссылка. Проверьте путь к изображению')
    })
  })
}), updateAvatar);

module.exports = usersRouter;