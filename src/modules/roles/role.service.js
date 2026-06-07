const prisma = require('../../shared/utils/prisma');

class RoleService {
  static async create(data) {
    const { permissionIds, ...roleData } = data;
    return prisma.role.create({
      data: {
        ...roleData,
        permissions: permissionIds ? { connect: permissionIds.map(id => ({ id })) } : undefined
      },
      include: { permissions: true }
    });
  }

  static async findAll() {
    return prisma.role.findMany({ include: { permissions: true, _count: { select: { users: true } } } });
  }

  static async findById(id) {
    return prisma.role.findUnique({
      where: { id },
      include: { permissions: true }
    });
  }

  static async update(id, data) {
    const { permissionIds, ...roleData } = data;
    return prisma.role.update({
      where: { id },
      data: {
        ...roleData,
        permissions: permissionIds ? { set: permissionIds.map(id => ({ id })) } : undefined
      },
      include: { permissions: true }
    });
  }

  static async delete(id) {
    return prisma.role.delete({ where: { id } });
  }

  static async getAllPermissions() {
    return prisma.permission.findMany();
  }

  static async createPermission(data) {
    return prisma.permission.create({ data });
  }
}

module.exports = RoleService;
