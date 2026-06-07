const express = require('express');
const NotificationController = require('./notification.controller');
const { authenticate } = require('../../shared/middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', NotificationController.findByUser);
router.get('/unread-count', NotificationController.getUnreadCount);
router.patch('/:id/read', NotificationController.markAsRead);
router.patch('/read-all', NotificationController.markAllAsRead);

module.exports = router;
