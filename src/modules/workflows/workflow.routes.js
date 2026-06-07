const express = require('express');
const WorkflowController = require('./workflow.controller');
const { authenticate } = require('../../shared/middleware/auth');
const { checkPermission } = require('../../shared/middleware/permission');
const { auditLog } = require('../../shared/middleware/audit');

const router = express.Router();

router.use(authenticate);

// Workflow Templates
router.post('/', checkPermission('workflow.create'), auditLog('create', 'workflow'), WorkflowController.create);
router.get('/', checkPermission('workflow.view'), WorkflowController.findAll);

// Instances — MUST come before /:id routes
router.get('/instances', checkPermission('workflow.view'), WorkflowController.findAllInstances);
router.get('/instances/:instanceId', checkPermission('workflow.view'), WorkflowController.findInstanceById);
router.post('/:id/instances', checkPermission('workflow.create'), auditLog('create_instance', 'workflow'), WorkflowController.createInstance);
router.post('/instances/:instanceId/steps/:stepId/advance', checkPermission('workflow.edit'), auditLog('advance_step', 'workflow'), WorkflowController.advanceStep);
router.post('/instances/:instanceId/steps/:stepId/reject', checkPermission('workflow.edit'), auditLog('reject_step', 'workflow'), WorkflowController.rejectStep);

// Steps
router.post('/:id/steps', checkPermission('workflow.edit'), auditLog('add_step', 'workflow'), WorkflowController.addStep);
router.put('/:id/steps/reorder', checkPermission('workflow.edit'), auditLog('reorder_steps', 'workflow'), WorkflowController.reorderSteps);
router.put('/steps/:stepId', checkPermission('workflow.edit'), auditLog('update_step', 'workflow'), WorkflowController.updateStep);
router.delete('/steps/:stepId', checkPermission('workflow.delete'), auditLog('delete_step', 'workflow'), WorkflowController.deleteStep);

// Stepper endpoints (for project workflow wizard)
router.get('/stepper/project/:projectId', checkPermission('workflow.view'), WorkflowController.getCurrentStep);
router.post('/stepper/instances/:instanceId/steps/:stepId/submit', checkPermission('workflow.edit'), auditLog('submit_step', 'workflow'), WorkflowController.submitAndAdvance);

// Workflow Templates — /:id routes LAST
router.get('/:id', checkPermission('workflow.view'), WorkflowController.findById);
router.put('/:id', checkPermission('workflow.edit'), auditLog('update', 'workflow'), WorkflowController.update);
router.delete('/:id', checkPermission('workflow.delete'), auditLog('delete', 'workflow'), WorkflowController.delete);

module.exports = router;
