const CommentService = require('./comment.service');
const ApiResponse = require('../../shared/utils/apiResponse');

class CommentController {
  static async create(req, res) {
    try {
      const comment = await CommentService.create({
        ...req.body,
        userId: req.user.id
      });
      return ApiResponse.success(res, comment, 'Comment added', 201);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async findByInstance(req, res) {
    try {
      const comments = await CommentService.findByInstance(req.params.instanceId);
      return ApiResponse.success(res, comments);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async update(req, res) {
    try {
      const comment = await CommentService.update(req.params.id, req.body.content);
      return ApiResponse.success(res, comment, 'Comment updated');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async delete(req, res) {
    try {
      await CommentService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Comment deleted');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = CommentController;
