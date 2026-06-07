const prisma = require('../../shared/utils/prisma');

class OrganizationService {
  static async create(data) {
    return prisma.organization.create({ data });
  }

  static async findAll() {
    return prisma.organization.findMany({
      include: {
        _count: { select: { users: true, departments: true, projects: true } }
      }
    });
  }

  static async findById(id) {
    return prisma.organization.findUnique({
      where: { id },
      include: {
        departments: { include: { teams: true } },
        _count: { select: { users: true, projects: true } }
      }
    });
  }

  static async update(id, data) {
    return prisma.organization.update({ where: { id }, data });
  }

  static async delete(id) {
    return prisma.organization.delete({ where: { id } });
  }

  // Department
  static async createDepartment(data) {
    return prisma.department.create({ data });
  }

  static async getDepartments(organizationId) {
    return prisma.department.findMany({
      where: { organizationId },
      include: { teams: true, _count: { select: { users: true } } }
    });
  }

  static async updateDepartment(id, data) {
    return prisma.department.update({ where: { id }, data });
  }

  static async deleteDepartment(id) {
    return prisma.department.delete({ where: { id } });
  }

  // Team
  static async createTeam(data) {
    return prisma.team.create({ data });
  }

  static async getTeams(departmentId) {
    return prisma.team.findMany({
      where: { departmentId },
      include: { _count: { select: { users: true } } }
    });
  }

  static async updateTeam(id, data) {
    return prisma.team.update({ where: { id }, data });
  }

  static async deleteTeam(id) {
    return prisma.team.delete({ where: { id } });
  }
}

module.exports = OrganizationService;
