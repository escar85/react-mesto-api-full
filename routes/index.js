const router = require('express').Router();
const cardsRouter = require('./cards');
const usersRouter = require('./users');

router.use('/', cardsRouter);
router.use('/', usersRouter);

module.exports = router;