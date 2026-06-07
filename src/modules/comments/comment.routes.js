const express = require('express');
const CommentController = require('./comment.controller');
const { authenticate } = require('../../shared/middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', CommentController.create);
router.get('/instance/:instanceId', CommentController.findByInstance);
router.put('/:id', CommentController.update);
router.delete('/:id', CommentController.delete);

module.exports = router;
