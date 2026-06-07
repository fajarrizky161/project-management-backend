const prisma = require('../../shared/utils/prisma');

class CommentService {
  static async create(data) {
    return prisma.comment.create({
      data,
      include: { user: { select: { id: true, fullName: true, avatar: true } } }
    });
  }

  static async findByInstance(instanceId) {
    return prisma.comment.findMany({
      where: { instanceId },
      include: { user: { select: { id: true, fullName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async update(id, content) {
    return prisma.comment.update({
      where: { id },
      data: { content },
      include: { user: { select: { id: true, fullName: true, avatar: true } } }
    });
  }

  static async delete(id) {
    return prisma.comment.delete({ where: { id } });
  }
}

module.exports = CommentService;
