const express = require('express');
const SearchController = require('./search.controller');
const { authenticate } = require('../../shared/middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', SearchController.globalSearch);

module.exports = router;
