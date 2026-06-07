const prisma = require('../../shared/utils/prisma');

class PerformanceService {
  // ─── Get subordinate user IDs recursively ───
  static async getSubordinateIds(managerId) {
    const subordinates = await prisma.user.findMany({
      where: { managerId },
      select: { id: true },
    });
    const ids = subordinates.map(s => s.id);
    // Recursively get subordinates of subordinates
    for (const sub of subordinates) {
      const deeper = await this.getSubordinateIds(sub.id);
      ids.push(...deeper);
    }
    return ids;
  }

  // ─── Get team members (direct subordinates) ───
  static async getTeamMembers(managerId) {
    return prisma.user.findMany({
      where: { managerId },
      select: {
        id: true,
        fullName: true,
        email: true,
        jobTitle: true,
        avatar: true,
        role: { select: { name: true } },
      },
      orderBy: { fullName: 'asc' },
    });
  }

  // ─── Performance summary for a user ───
  static async getUserPerformance(userId, startDate, endDate) {
    const where = {
      assigneeId: userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    const tasks = await prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        estimatedHours: true,
        actualHours: true,
        createdAt: true,
        dueDate: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;
    const totalEstimated = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const totalActual = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
    const efficiency = totalEstimated > 0 ? ((totalEstimated / (totalActual || 1)) * 100).toFixed(1) : null;

    return {
      userId,
      period: { start: startDate, end: endDate },
      summary: {
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0,
        totalEstimatedHours: totalEstimated,
        totalActualHours: totalActual,
        efficiency: efficiency ? parseFloat(efficiency) : null,
        variance: totalEstimated - totalActual,
      },
      tasks,
    };
  }

  // ─── Team performance (manager view) ───
  static async getTeamPerformance(managerId, startDate, endDate) {
    const teamMembers = await this.getTeamMembers(managerId);

    const memberPerformances = await Promise.all(
      teamMembers.map(async (member) => {
        const perf = await this.getUserPerformance(member.id, startDate, endDate);
        return {
          user: member,
          ...perf.summary,
        };
      })
    );

    // Aggregate totals
    const teamTotals = memberPerformances.reduce(
      (acc, m) => ({
        totalTasks: acc.totalTasks + m.totalTasks,
        completedTasks: acc.completedTasks + m.completedTasks,
        totalEstimatedHours: acc.totalEstimatedHours + m.totalEstimatedHours,
        totalActualHours: acc.totalActualHours + m.totalActualHours,
      }),
      { totalTasks: 0, completedTasks: 0, totalEstimatedHours: 0, totalActualHours: 0 }
    );

    return {
      period: { start: startDate, end: endDate },
      teamTotals,
      members: memberPerformances,
    };
  }

  // ─── Daily breakdown for charts ───
  static async getDailyBreakdown(userId, startDate, endDate) {
    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        estimatedHours: true,
        actualHours: true,
        createdAt: true,
        status: true,
      },
    });

    // Group by date
    const dailyMap = {};
    tasks.forEach(task => {
      const dateKey = task.createdAt.toISOString().split('T')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, estimated: 0, actual: 0, tasks: 0, completed: 0 };
      }
      dailyMap[dateKey].estimated += task.estimatedHours || 0;
      dailyMap[dateKey].actual += task.actualHours || 0;
      dailyMap[dateKey].tasks += 1;
      if (task.status === 'DONE') dailyMap[dateKey].completed += 1;
    });

    return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
  }

  // ─── Weekly breakdown ───
  static async getWeeklyBreakdown(userId, startDate, endDate) {
    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        estimatedHours: true,
        actualHours: true,
        createdAt: true,
        status: true,
      },
    });

    const weeklyMap = {};
    tasks.forEach(task => {
      const d = new Date(task.createdAt);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay()); // Sunday
      const weekKey = weekStart.toISOString().split('T')[0];
      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = { week: weekKey, estimated: 0, actual: 0, tasks: 0, completed: 0 };
      }
      weeklyMap[weekKey].estimated += task.estimatedHours || 0;
      weeklyMap[weekKey].actual += task.actualHours || 0;
      weeklyMap[weekKey].tasks += 1;
      if (task.status === 'DONE') weeklyMap[weekKey].completed += 1;
    });

    return Object.values(weeklyMap).sort((a, b) => a.week.localeCompare(b.week));
  }

  // ─── Monthly breakdown ───
  static async getMonthlyBreakdown(userId, startDate, endDate) {
    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        estimatedHours: true,
        actualHours: true,
        createdAt: true,
        status: true,
      },
    });

    const monthlyMap = {};
    tasks.forEach(task => {
      const d = new Date(task.createdAt);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, estimated: 0, actual: 0, tasks: 0, completed: 0 };
      }
      monthlyMap[monthKey].estimated += task.estimatedHours || 0;
      monthlyMap[monthKey].actual += task.actualHours || 0;
      monthlyMap[monthKey].tasks += 1;
      if (task.status === 'DONE') monthlyMap[monthKey].completed += 1;
    });

    return Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));
  }
}

module.exports = PerformanceService;
