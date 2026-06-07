const NotificationService = require('./notification.service');
const ApiResponse = require('../../shared/utils/apiResponse');

class NotificationController {
  static async findByUser(req, res) {
    try {
      const notifications = await NotificationService.findByUser(req.user.id);
      return ApiResponse.success(res, notifications);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async markAsRead(req, res) {
    try {
      await NotificationService.markAsRead(req.params.id, req.user.id);
      return ApiResponse.success(res, null, 'Notification marked as read');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async markAllAsRead(req, res) {
    try {
      await NotificationService.markAllAsRead(req.user.id);
      return ApiResponse.success(res, null, 'All notifications marked as read');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async getUnreadCount(req, res) {
    try {
      const count = await NotificationService.getUnreadCount(req.user.id);
      return ApiResponse.success(res, { count });
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = NotificationController;
