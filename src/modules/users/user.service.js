const bcrypt = require('bcryptjs');
const prisma = require('../../shared/utils/prisma');

class UserService {
  static async create(data) {
    const hashedPassword = await bcrypt.hash(data.password || 'changeme123', 10);
    return prisma.user.create({
      data: { ...data, password: hashedPassword },
      include: { role: true, department: true, team: true, organization: true, manager: { select: { id: true, fullName: true, jobTitle: true } } }
    });
  }

  static async findAll(query = {}) {
    const { page = 1, limit = 10, search, organizationId, status } = query;
    const skip = (page - 1) * limit;

    const where = {};
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: { role: true, department: true, team: true, organization: true, manager: { select: { id: true, fullName: true, jobTitle: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return { users, total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async findById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: { include: { permissions: true } }, department: true, team: true, organization: true, manager: { select: { id: true, fullName: true, jobTitle: true } }, subordinates: { select: { id: true, fullName: true, jobTitle: true, status: true } } }
    });
    if (user) delete user.password;
    return user;
  }

  static async update(id, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const user = await prisma.user.update({
      where: { id },
      data,
      include: { role: true, department: true, team: true, organization: true, manager: { select: { id: true, fullName: true, jobTitle: true } } }
    });
    delete user.password;
    return user;
  }

  static async deactivate(id) {
    return prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' }
    });
  }

  static async delete(id) {
    return prisma.user.delete({ where: { id } });
  }
}

module.exports = UserService;
