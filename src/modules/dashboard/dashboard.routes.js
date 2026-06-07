const express = require('express');
const DashboardController = require('./dashboard.controller');
const { authenticate } = require('../../shared/middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/stats', DashboardController.getStats);
router.get('/activity', DashboardController.getRecentActivity);
router.get('/projects', DashboardController.getProjectProgress);

module.exports = router;
