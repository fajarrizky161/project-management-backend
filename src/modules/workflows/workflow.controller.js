const WorkflowService = require('./workflow.service');
const ApiResponse = require('../../shared/utils/apiResponse');

class WorkflowController {
  // --- Workflow Templates ---
  static async create(req, res) {
    try {
      const workflow = await WorkflowService.create({
        ...req.body,
        organizationId: req.user.organizationId
      });
      return ApiResponse.success(res, workflow, 'Workflow created', 201);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async findAll(req, res) {
    try {
      const workflows = await WorkflowService.findAll(req.user.organizationId);
      return ApiResponse.success(res, workflows);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async findById(req, res) {
    try {
      const workflow = await WorkflowService.findById(req.params.id);
      if (!workflow) return ApiResponse.error(res, 'Workflow not found', 404);
      return ApiResponse.success(res, workflow);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async update(req, res) {
    try {
      const workflow = await WorkflowService.update(req.params.id, req.body);
      return ApiResponse.success(res, workflow, 'Workflow updated');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async delete(req, res) {
    try {
      await WorkflowService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Workflow deleted');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  // --- Steps ---
  static async addStep(req, res) {
    try {
      const step = await WorkflowService.addStep(req.params.id, req.body, req.body.order);
      return ApiResponse.success(res, step, 'Step added', 201);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async updateStep(req, res) {
    try {
      const step = await WorkflowService.updateStep(req.params.stepId, req.body);
      return ApiResponse.success(res, step, 'Step updated');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async deleteStep(req, res) {
    try {
      await WorkflowService.deleteStep(req.params.stepId);
      return ApiResponse.success(res, null, 'Step deleted');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async reorderSteps(req, res) {
    try {
      const { stepOrders } = req.body;
      await WorkflowService.reorderSteps(req.params.id, stepOrders);
      return ApiResponse.success(res, null, 'Steps reordered');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  // --- Instances ---
  static async createInstance(req, res) {
    try {
      const instance = await WorkflowService.createInstance(req.params.id, req.body, req.user.id);
      return ApiResponse.success(res, instance, 'Workflow instance created', 201);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async findAllInstances(req, res) {
    try {
      const result = await WorkflowService.findAllInstances(req.query);
      return ApiResponse.paginated(res, result.instances, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      });
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async findInstanceById(req, res) {
    try {
      const instance = await WorkflowService.findInstanceById(req.params.instanceId);
      if (!instance) return ApiResponse.error(res, 'Instance not found', 404);
      return ApiResponse.success(res, instance);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async advanceStep(req, res) {
    try {
      const instance = await WorkflowService.advanceStep(
        req.params.instanceId,
        req.params.stepId,
        req.body.formData,
        req.user.id
      );
      return ApiResponse.success(res, instance, 'Step advanced');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  // --- Stepper: get current step for a project ---
  static async getCurrentStep(req, res) {
    try {
      const { projectId } = req.params;
      const instance = await WorkflowService.findActiveInstanceByProject(projectId);
      if (!instance) return ApiResponse.error(res, 'No active workflow instance found', 404);

      const currentStep = instance.steps.find(s => s.status === 'IN_PROGRESS');
      return ApiResponse.success(res, {
        instance,
        currentStep,
        totalSteps: instance.steps.length,
        currentIndex: instance.steps.findIndex(s => s.status === 'IN_PROGRESS') + 1,
      });
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  // --- Stepper: submit current step & advance ---
  static async submitAndAdvance(req, res) {
    try {
      const { instanceId, stepId } = req.params;
      const { formData } = req.body;
      const instance = await WorkflowService.advanceStep(instanceId, stepId, formData, req.user.id);
      const nextStep = instance.steps.find(s => s.status === 'IN_PROGRESS');
      return ApiResponse.success(res, {
        instance,
        nextStep,
        isCompleted: instance.status === 'COMPLETED',
        totalSteps: instance.steps.length,
        currentIndex: instance.steps.findIndex(s => s.status === 'IN_PROGRESS') + 1,
      });
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async rejectStep(req, res) {
    try {
      const instance = await WorkflowService.rejectStep(req.params.instanceId, req.params.stepId, req.user.id);
      return ApiResponse.success(res, instance, 'Step rejected');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = WorkflowController;
