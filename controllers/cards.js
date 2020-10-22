const Card = require('../models/card');
const WrongInputDataError = require('../middlewares/errors/wrong-input-data-error');

const getCards = (req, res, next) => {
  Card.find({})
    .then(cards => res.send(cards))
    .catch(next);
}

const createCard = (req, res, next) => {
  const { name, link } = req.body
  Card.create({ name, link, owner: req.user._id })
    .then(card => res.send({ data: card }))
    .catch(err => {
      if (err.name === 'ValidationError') return new WrongInputDataError('Ошибка валидации. Проверьте введенные данные.')
      console.log(err);
    })
    .catch(next);
}

const deleteCard = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then(card => res.send({ data: card }))
    .catch(err => {
      if (err.name === 'CastError') return new WrongInputDataError('Несуществующий Id карточки или карточка отсутствует')
      console.log(err);
    })
    .catch(next);
}

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .then(card => res.send({ data: card }))
    .catch(err => {
      if (err.name === 'CastError') return new WrongInputDataError('Несуществующий Id карточки или карточка отсутствует')
      console.log(err);
    })
    .catch(next);
}


const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .then(card => res.send({ data: card }))
    .catch(err => {
      if (err.name === 'CastError') return new WrongInputDataError('Несуществующий Id карточки или карточка отсутствует')
      console.log(err);
    })
    .catch(next);
}

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard
}