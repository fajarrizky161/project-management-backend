const PerformanceService = require('./performance.service');

class PerformanceController {
  static async getTeamMembers(req, res, next) {
    try {
      const members = await PerformanceService.getTeamMembers(req.user.id);
      res.json({ data: members });
    } catch (error) {
      next(error);
    }
  }

  static async getUserPerformance(req, res, next) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();
      const data = await PerformanceService.getUserPerformance(userId, start, end);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getTeamPerformance(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();
      const data = await PerformanceService.getTeamPerformance(req.user.id, start, end);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getDailyBreakdown(req, res, next) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();
      const data = await PerformanceService.getDailyBreakdown(userId, start, end);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getWeeklyBreakdown(req, res, next) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();
      const data = await PerformanceService.getWeeklyBreakdown(userId, start, end);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getMonthlyBreakdown(req, res, next) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();
      const data = await PerformanceService.getMonthlyBreakdown(userId, start, end);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PerformanceController;
