const usersRouter = require('express').Router();
const { getUsers, getUserById, updateProfile, updateAvatar } = require('../controllers/users');
const { celebrate, Joi } = require('celebrate');

usersRouter.get('/users', getUsers);

usersRouter.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum()
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
    avatar: Joi.string().required().domain()
  })
}), updateAvatar);

module.exports = usersRouter;