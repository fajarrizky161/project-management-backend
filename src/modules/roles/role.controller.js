const RoleService = require('./role.service');
const ApiResponse = require('../../shared/utils/apiResponse');

class RoleController {
  static async create(req, res) {
    try {
      const role = await RoleService.create(req.body);
      return ApiResponse.success(res, role, 'Role created', 201);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async findAll(req, res) {
    try {
      const roles = await RoleService.findAll();
      return ApiResponse.success(res, roles);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async findById(req, res) {
    try {
      const role = await RoleService.findById(req.params.id);
      if (!role) return ApiResponse.error(res, 'Role not found', 404);
      return ApiResponse.success(res, role);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async update(req, res) {
    try {
      const role = await RoleService.update(req.params.id, req.body);
      return ApiResponse.success(res, role, 'Role updated');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async delete(req, res) {
    try {
      await RoleService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Role deleted');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async getPermissions(req, res) {
    try {
      const permissions = await RoleService.getAllPermissions();
      return ApiResponse.success(res, permissions);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async createPermission(req, res) {
    try {
      const permission = await RoleService.createPermission(req.body);
      return ApiResponse.success(res, permission, 'Permission created', 201);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = RoleController;
