const Card = require('../models/card');
const NotFoundError = require('../middlewares/errors/not-found-error');
const ForbiddenError = require('../middlewares/errors/forbiddenError');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send(card))
    .catch(next);
};

const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId).orFail(new NotFoundError('Несуществующий Id карточки или карточка отсутствует'))
    .then((card) => {
      if (req.user._id.toString() === card.owner.toString()) {
        res.send(card);
        card.remove();
      }
      throw new ForbiddenError('Недостаточно прав пользователя для удаления');
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  ).orFail(new NotFoundError('Несуществующий Id карточки или карточка отсутствует'))
    .then((card) => res.send({ data: card }))
    .catch(next);
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  ).orFail(new NotFoundError('Несуществующий Id карточки или карточка отсутствует'))
    .then((card) => res.send({ data: card }))
    .catch(next);
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
