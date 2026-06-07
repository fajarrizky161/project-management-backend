const ProjectService = require('./project.service');
const ApiResponse = require('../../shared/utils/apiResponse');

class ProjectController {
  static async create(req, res) {
    try {
      const project = await ProjectService.create({
        ...req.body,
        organizationId: req.user.organizationId
      }, req.user.id);
      return ApiResponse.success(res, project, 'Project created', 201);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async findAll(req, res) {
    try {
      const result = await ProjectService.findAll({
        ...req.query,
        organizationId: req.user.organizationId
      });
      return ApiResponse.paginated(res, result.projects, {
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
      const project = await ProjectService.findById(req.params.id);
      if (!project) return ApiResponse.error(res, 'Project not found', 404);
      return ApiResponse.success(res, project);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async update(req, res) {
    try {
      const project = await ProjectService.update(req.params.id, req.body);
      return ApiResponse.success(res, project, 'Project updated');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async delete(req, res) {
    try {
      await ProjectService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Project deleted');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = ProjectController;
