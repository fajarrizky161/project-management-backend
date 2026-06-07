const prisma = require('../../shared/utils/prisma');

class TaskService {
  static async create(data) {
    const { projectId, assigneeId, dueDate, estimatedHours, actualHours, ...taskData } = data;
    const createData = { ...taskData };
    if (assigneeId) createData.assigneeId = assigneeId;
    if (dueDate) createData.dueDate = new Date(dueDate);
    if (estimatedHours !== undefined && estimatedHours !== null && estimatedHours !== '') {
      createData.estimatedHours = parseFloat(estimatedHours);
    }
    if (actualHours !== undefined && actualHours !== null && actualHours !== '') {
      createData.actualHours = parseFloat(actualHours);
    }
    return prisma.task.create({
      data: createData,
      include: { assignee: { select: { id: true, fullName: true, avatar: true } } }
    });
  }

  static async findAll(query = {}) {
    const { page = 1, limit = 10, status, assigneeId, instanceId, priority } = query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (instanceId) where.instanceId = instanceId;
    if (priority) where.priority = priority;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: { assignee: { select: { id: true, fullName: true, avatar: true, jobTitle: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.task.count({ where })
    ]);

    return { tasks, total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async findById(id) {
    return prisma.task.findUnique({
      where: { id },
      include: { assignee: { select: { id: true, fullName: true, avatar: true, jobTitle: true } } }
    });
  }

  static async update(id, data) {
    const updateData = { ...data };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.estimatedHours !== undefined && data.estimatedHours !== null && data.estimatedHours !== '') {
      updateData.estimatedHours = parseFloat(data.estimatedHours);
    } else if (data.estimatedHours === '' || data.estimatedHours === null) {
      updateData.estimatedHours = null;
    }
    if (data.actualHours !== undefined && data.actualHours !== null && data.actualHours !== '') {
      updateData.actualHours = parseFloat(data.actualHours);
    } else if (data.actualHours === '' || data.actualHours === null) {
      updateData.actualHours = null;
    }
    return prisma.task.update({
      where: { id },
      data: updateData,
      include: { assignee: { select: { id: true, fullName: true, avatar: true, jobTitle: true } } }
    });
  }

  static async delete(id) {
    return prisma.task.delete({ where: { id } });
  }
}

module.exports = TaskService;
