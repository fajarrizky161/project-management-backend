const OrganizationService = require('./organization.service');
const ApiResponse = require('../../shared/utils/apiResponse');

class OrganizationController {
  static async create(req, res) {
    try {
      const org = await OrganizationService.create(req.body);
      return ApiResponse.success(res, org, 'Organization created', 201);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async findAll(req, res) {
    try {
      const orgs = await OrganizationService.findAll();
      return ApiResponse.success(res, orgs);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async findById(req, res) {
    try {
      const org = await OrganizationService.findById(req.params.id);
      if (!org) return ApiResponse.error(res, 'Organization not found', 404);
      return ApiResponse.success(res, org);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async update(req, res) {
    try {
      const org = await OrganizationService.update(req.params.id, req.body);
      return ApiResponse.success(res, org, 'Organization updated');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async delete(req, res) {
    try {
      await OrganizationService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Organization deleted');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  // Departments
  static async createDepartment(req, res) {
    try {
      const dept = await OrganizationService.createDepartment(req.body);
      return ApiResponse.success(res, dept, 'Department created', 201);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async getDepartments(req, res) {
    try {
      const depts = await OrganizationService.getDepartments(req.params.orgId);
      return ApiResponse.success(res, depts);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async updateDepartment(req, res) {
    try {
      const dept = await OrganizationService.updateDepartment(req.params.id, req.body);
      return ApiResponse.success(res, dept, 'Department updated');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async deleteDepartment(req, res) {
    try {
      await OrganizationService.deleteDepartment(req.params.id);
      return ApiResponse.success(res, null, 'Department deleted');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  // Teams
  static async createTeam(req, res) {
    try {
      const team = await OrganizationService.createTeam(req.body);
      return ApiResponse.success(res, team, 'Team created', 201);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async getTeams(req, res) {
    try {
      const teams = await OrganizationService.getTeams(req.params.deptId);
      return ApiResponse.success(res, teams);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async updateTeam(req, res) {
    try {
      const team = await OrganizationService.updateTeam(req.params.id, req.body);
      return ApiResponse.success(res, team, 'Team updated');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async deleteTeam(req, res) {
    try {
      await OrganizationService.deleteTeam(req.params.id);
      return ApiResponse.success(res, null, 'Team deleted');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = OrganizationController;
