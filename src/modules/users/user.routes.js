const express = require('express');
const UserController = require('./user.controller');
const { authenticate } = require('../../shared/middleware/auth');
const { checkPermission } = require('../../shared/middleware/permission');

const router = express.Router();

router.use(authenticate);

router.post('/', checkPermission('user.create'), UserController.create);
router.get('/', checkPermission('user.view'), UserController.findAll);
router.get('/:id', checkPermission('user.view'), UserController.findById);
router.put('/:id', checkPermission('user.edit'), UserController.update);
router.patch('/:id/deactivate', checkPermission('user.edit'), UserController.deactivate);
router.delete('/:id', checkPermission('user.delete'), UserController.delete);

module.exports = router;
