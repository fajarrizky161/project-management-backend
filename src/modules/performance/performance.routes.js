const express = require('express');
const PerformanceController = require('./performance.controller');
const { authenticate } = require('../../shared/middleware/auth');
const { checkPermission } = require('../../shared/middleware/permission');

const router = express.Router();

router.use(authenticate);

// Get team members (subordinates)
router.get('/team', checkPermission('user.view'), PerformanceController.getTeamMembers);

// Team performance overview (manager view)
router.get('/team/overview', checkPermission('user.view'), PerformanceController.getTeamPerformance);

// Individual user performance
router.get('/user/:userId', checkPermission('user.view'), PerformanceController.getUserPerformance);

// Breakdowns
router.get('/user/:userId/daily', checkPermission('user.view'), PerformanceController.getDailyBreakdown);
router.get('/user/:userId/weekly', checkPermission('user.view'), PerformanceController.getWeeklyBreakdown);
router.get('/user/:userId/monthly', checkPermission('user.view'), PerformanceController.getMonthlyBreakdown);

module.exports = router;
