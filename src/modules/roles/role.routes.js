const express = require('express');
const RoleController = require('./role.controller');
const { authenticate } = require('../../shared/middleware/auth');
const { checkPermission } = require('../../shared/middleware/permission');

const router = express.Router();

router.use(authenticate);

router.get('/permissions', RoleController.getPermissions);
router.post('/permissions', checkPermission('role.edit'), RoleController.createPermission);
router.post('/', checkPermission('role.edit'), RoleController.create);
router.get('/', checkPermission('role.view'), RoleController.findAll);
router.get('/:id', checkPermission('role.view'), RoleController.findById);
router.put('/:id', checkPermission('role.edit'), RoleController.update);
router.delete('/:id', checkPermission('role.edit'), RoleController.delete);

module.exports = router;
