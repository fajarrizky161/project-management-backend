const prisma = require('../../shared/utils/prisma');

class NotificationService {
  static async create(data) {
    return prisma.notification.create({ data });
  }

  static async createBulk(notifications) {
    return prisma.notification.createMany({ data: notifications });
  }

  static async findByUser(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async markAsRead(id, userId) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true }
    });
  }

  static async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }

  static async getUnreadCount(userId) {
    return prisma.notification.count({
      where: { userId, isRead: false }
    });
  }
}

module.exports = NotificationService;
