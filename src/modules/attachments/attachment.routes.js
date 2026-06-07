const express = require('express');
const AttachmentController = require('./attachment.controller');
const AttachmentService = require('./attachment.service');
const { authenticate } = require('../../shared/middleware/auth');
const { checkPermission } = require('../../shared/middleware/permission');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  checkPermission('workflow.edit'),
  AttachmentService.getUploadMiddleware('files', 5),
  AttachmentController.upload
);

router.get('/instance/:instanceId', checkPermission('workflow.view'), AttachmentController.getByInstance);
router.get('/comment/:commentId', checkPermission('workflow.view'), AttachmentController.getByComment);
router.delete('/:id', checkPermission('workflow.edit'), AttachmentController.delete);

module.exports = router;
