const TaskService = require('./task.service');
const ApiResponse = require('../../shared/utils/apiResponse');

class TaskController {
  static async create(req, res) {
    try {
      const task = await TaskService.create(req.body);
      return ApiResponse.success(res, task, 'Task created', 201);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async findAll(req, res) {
    try {
      const result = await TaskService.findAll(req.query);
      return ApiResponse.paginated(res, result.tasks, {
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
      const task = await TaskService.findById(req.params.id);
      if (!task) return ApiResponse.error(res, 'Task not found', 404);
      return ApiResponse.success(res, task);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async update(req, res) {
    try {
      const task = await TaskService.update(req.params.id, req.body);
      return ApiResponse.success(res, task, 'Task updated');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async delete(req, res) {
    try {
      await TaskService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Task deleted');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = TaskController;
