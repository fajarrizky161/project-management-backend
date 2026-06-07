const express = require('express');
const TaskController = require('./task.controller');
const { authenticate } = require('../../shared/middleware/auth');
const { checkPermission } = require('../../shared/middleware/permission');
const { auditLog } = require('../../shared/middleware/audit');

const router = express.Router();

router.use(authenticate);

router.post('/', checkPermission('task.create'), auditLog('create', 'task'), TaskController.create);
router.get('/', checkPermission('task.view'), TaskController.findAll);
router.get('/:id', checkPermission('task.view'), TaskController.findById);
router.put('/:id', checkPermission('task.edit'), auditLog('update', 'task'), TaskController.update);
router.delete('/:id', checkPermission('task.delete'), auditLog('delete', 'task'), TaskController.delete);

module.exports = router;
