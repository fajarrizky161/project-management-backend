const UserService = require('./user.service');
const ApiResponse = require('../../shared/utils/apiResponse');

class UserController {
  static async create(req, res) {
    try {
      const user = await UserService.create({ ...req.body, organizationId: req.user.organizationId });
      return ApiResponse.success(res, user, 'User created', 201);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async findAll(req, res) {
    try {
      const result = await UserService.findAll({ ...req.query, organizationId: req.user.organizationId });
      return ApiResponse.paginated(res, result.users, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      });
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async findById(req, res) {
    try {
      const user = await UserService.findById(req.params.id);
      if (!user) return ApiResponse.error(res, 'User not found', 404);
      return ApiResponse.success(res, user);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async update(req, res) {
    try {
      const user = await UserService.update(req.params.id, req.body);
      return ApiResponse.success(res, user, 'User updated');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async deactivate(req, res) {
    try {
      await UserService.deactivate(req.params.id);
      return ApiResponse.success(res, null, 'User deactivated');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async delete(req, res) {
    try {
      await UserService.delete(req.params.id);
      return ApiResponse.success(res, null, 'User deleted');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = UserController;
