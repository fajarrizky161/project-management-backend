const express = require('express');
const ProjectController = require('./project.controller');
const { authenticate } = require('../../shared/middleware/auth');
const { checkPermission } = require('../../shared/middleware/permission');

const router = express.Router();

router.use(authenticate);

router.post('/', checkPermission('project.create'), ProjectController.create);
router.get('/', checkPermission('project.view'), ProjectController.findAll);
router.get('/:id', checkPermission('project.view'), ProjectController.findById);
router.put('/:id', checkPermission('project.edit'), ProjectController.update);
router.delete('/:id', checkPermission('project.delete'), ProjectController.delete);

module.exports = router;
