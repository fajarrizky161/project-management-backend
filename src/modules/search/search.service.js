const prisma = require('../../shared/utils/prisma');

class SearchService {
  static async globalSearch(organizationId, query, limit) {
    if (!limit) limit = 5;
    if (!query || query.trim().length < 2) {
      return { projects: [], tasks: [], workflows: [], users: [], comments: [] };
    }

    const search = query.trim();

    const [projects, tasks, workflows, users, comments] = await Promise.all([
      prisma.project.findMany({
        where: {
          organizationId: organizationId,
          OR: [
            { name: { contains: search } },
            { code: { contains: search } },
            { description: { contains: search } },
          ],
        },
        select: { id: true, name: true, code: true, status: true, priority: true },
        take: limit,
      }),

      prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
          ],
        },
        select: { id: true, title: true, status: true, priority: true, dueDate: true },
        include: { assignee: { select: { fullName: true } } },
        take: limit,
      }),

      prisma.workflow.findMany({
        where: {
          organizationId: organizationId,
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        },
        select: { id: true, name: true, description: true },
        take: limit,
      }),

      prisma.user.findMany({
        where: {
          organizationId: organizationId,
          OR: [
            { fullName: { contains: search } },
            { email: { contains: search } },
            { position: { contains: search } },
          ],
        },
        select: { id: true, fullName: true, email: true, position: true, avatar: true },
        take: limit,
      }),

      prisma.comment.findMany({
        where: {
          content: { contains: search },
        },
        select: { id: true, content: true, createdAt: true },
        include: {
          user: { select: { fullName: true } },
          instance: { select: { id: true, title: true } },
        },
        take: limit,
      }),
    ]);

    return {
      projects: projects,
      tasks: tasks,
      workflows: workflows,
      users: users,
      comments: comments
    };
  }
}

module.exports = SearchService;
