const Card = require('../models/card');
const WrongInputDataError = require('../middlewares/errors/wrong-input-data-error');
const NotFoundError = require('../middlewares/errors/not-found-error');
const ForbiddenError = require('../middlewares/errors/forbiddenError');

const getCards = (req, res, next) => {
  Card.find({})
    .then(cards => res.send(cards))
    .catch(next);
}

const createCard = (req, res, next) => {
  const { name, link } = req.body
  Card.create({ name, link, owner: req.user._id })
    .then(card => res.send(card))
    .catch(err => {
      if (err.name === 'ValidationError') {
        throw new WrongInputDataError('Ошибка валидации. Проверьте введенные данные.')
      }
      throw new Error(err);
    })
    .catch(next);
}

const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId).orFail(new NotFoundError('Несуществующий Id карточки или карточка отсутствует'))
    .then(card => {
      if (!req.params.user_id === card.owner) {
        throw new ForbiddenError('Недостаточно прав пользователя для удаления')
      }
      res.send(card)
      card.remove()
    })
    .catch(next);
}

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  ).orFail(new WrongInputDataError('Несуществующий Id карточки или карточка отсутствует'))
    .then(card => res.send({ data: card }))
    .catch(err => { throw new Error(err) })
    .catch(next);
}


const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true }
  ).orFail(new WrongInputDataError('Несуществующий Id карточки или карточка отсутствует'))
    .then(card => res.send({ data: card }))
    .catch(err => { throw new Error(err) })
    .catch(next);
}

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard
}