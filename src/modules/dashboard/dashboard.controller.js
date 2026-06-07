const DashboardService = require('./dashboard.service');
const ApiResponse = require('../../shared/utils/apiResponse');

class DashboardController {
  static async getStats(req, res) {
    try {
      const stats = await DashboardService.getStats(req.user.organizationId);
      return ApiResponse.success(res, stats);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async getRecentActivity(req, res) {
    try {
      const activity = await DashboardService.getRecentActivity(req.user.organizationId);
      return ApiResponse.success(res, activity);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async getProjectProgress(req, res) {
    try {
      const projects = await DashboardService.getProjectProgress(req.user.organizationId);
      return ApiResponse.success(res, projects);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = DashboardController;
