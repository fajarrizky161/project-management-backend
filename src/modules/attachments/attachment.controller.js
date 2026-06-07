const AttachmentService = require('./attachment.service');
const path = require('path');

class AttachmentController {
  static async upload(req, res, next) {
    try {
      const files = req.files;
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const { instanceId, commentId } = req.body;
      const uploaderId = req.user.id;

      const attachments = [];
      for (const file of files) {
        const attachment = await AttachmentService.create({
          filename: file.filename,
          path: `/uploads/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype,
          uploaderId,
          instanceId: instanceId || null,
          commentId: commentId || null,
        });
        attachments.push(attachment);
      }

      res.status(201).json({
        message: `${attachments.length} file(s) uploaded successfully`,
        data: attachments,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getByInstance(req, res, next) {
    try {
      const { instanceId } = req.params;
      const attachments = await AttachmentService.findByInstanceId(instanceId);
      res.json({ data: attachments });
    } catch (error) {
      next(error);
    }
  }

  static async getByComment(req, res, next) {
    try {
      const { commentId } = req.params;
      const attachments = await AttachmentService.findByCommentId(commentId);
      res.json({ data: attachments });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await AttachmentService.delete(id);
      res.json({ message: 'Attachment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AttachmentController;
