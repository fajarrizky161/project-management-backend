const express = require('express');
const OrganizationController = require('./organization.controller');
const { authenticate } = require('../../shared/middleware/auth');
const { checkPermission } = require('../../shared/middleware/permission');

const router = express.Router();

router.use(authenticate);

router.post('/', checkPermission('organization.create'), OrganizationController.create);
router.get('/', checkPermission('organization.view'), OrganizationController.findAll);
router.get('/:id', checkPermission('organization.view'), OrganizationController.findById);
router.put('/:id', checkPermission('organization.edit'), OrganizationController.update);
router.delete('/:id', checkPermission('organization.delete'), OrganizationController.delete);

// Departments
router.post('/:orgId/departments', checkPermission('organization.edit'), OrganizationController.createDepartment);
router.get('/:orgId/departments', checkPermission('organization.view'), OrganizationController.getDepartments);
router.put('/departments/:id', checkPermission('organization.edit'), OrganizationController.updateDepartment);
router.delete('/departments/:id', checkPermission('organization.delete'), OrganizationController.deleteDepartment);

// Teams
router.post('/departments/:deptId/teams', checkPermission('organization.edit'), OrganizationController.createTeam);
router.get('/departments/:deptId/teams', checkPermission('organization.view'), OrganizationController.getTeams);
router.put('/teams/:id', checkPermission('organization.edit'), OrganizationController.updateTeam);
router.delete('/teams/:id', checkPermission('organization.delete'), OrganizationController.deleteTeam);

module.exports = router;
