const prisma = require('../../shared/utils/prisma');

class DashboardService {
  static async getStats(organizationId) {
    const [
      totalProjects,
      activeProjects,
      totalInstances,
      completedInstances,
      pendingApprovals,
      totalTasks,
      activeTasks,
      completedTasks,
      totalUsers
    ] = await Promise.all([
      prisma.project.count({ where: { organizationId } }),
      prisma.project.count({ where: { organizationId, status: 'ACTIVE' } }),
      prisma.workflowInstance.count(),
      prisma.workflowInstance.count({ where: { status: 'COMPLETED' } }),
      prisma.workflowInstance.count({ where: { status: 'WAITING_APPROVAL' } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: { in: ['TODO', 'IN_PROGRESS', 'REVIEW'] } } }),
      prisma.task.count({ where: { status: 'DONE' } }),
      prisma.user.count({ where: { organizationId } })
    ]);

    const [runningInstances, rejectedInstances, createdInstances] = await Promise.all([
      prisma.workflowInstance.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.workflowInstance.count({ where: { status: 'REJECTED' } }),
      prisma.workflowInstance.count({ where: { status: 'CREATED' } }),
    ]);

    return {
      totalProjects,
      activeProjects,
      totalInstances,
      createdInstances,
      runningInstances,
      completedInstances,
      rejectedInstances,
      pendingApprovals,
      totalTasks,
      activeTasks,
      completedTasks,
      totalUsers
    };
  }

  static async getRecentActivity(organizationId, limit = 20) {
    return prisma.activityLog.findMany({
      where: { user: { organizationId } },
      include: { user: { select: { id: true, fullName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  static async getProjectProgress(organizationId) {
    return prisma.project.findMany({
      where: { organizationId },
      select: { id: true, name: true, status: true, startDate: true, dueDate: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
  }
}

module.exports = DashboardService;
