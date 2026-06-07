const prisma = require('../../shared/utils/prisma');

class WorkflowService {
  // --- Workflow Template ---
  static async create(data) {
    const { steps, ...workflowData } = data;
    return prisma.workflow.create({
      data: {
        ...workflowData,
        steps: steps ? {
          create: steps.map((step, index) => ({
            name: step.name,
            description: step.description,
            color: step.color,
            icon: step.icon,
            sla: step.sla,
            estimatedHours: step.estimatedHours,
            assignedUserId: step.assignedUserId || null,
            order: index,
            formSchema: step.formSchema,
            type: step.type || 'FORM',
            config: step.config
          }))
        } : undefined
      },
      include: { steps: { orderBy: { order: 'asc' } } }
    });
  }

  static async findAll(organizationId) {
    return prisma.workflow.findMany({
      where: { organizationId },
      include: {
        steps: { orderBy: { order: 'asc' } },
        _count: { select: { instances: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async findById(id) {
    return prisma.workflow.findUnique({
      where: { id },
      include: { steps: { orderBy: { order: 'asc' } } }
    });
  }

  static async update(id, data) {
    const { steps, ...workflowData } = data;
    if (steps && Array.isArray(steps)) {
      // Get all current step IDs for this workflow
      const currentSteps = await prisma.workflowStep.findMany({
        where: { workflowId: id },
        select: { id: true },
      });
      const currentIds = new Set(currentSteps.map(s => s.id));

      // Incoming real IDs (exclude temp IDs which are new steps)
      const incomingRealIds = new Set(
        steps.filter(s => s.id && !s.id.startsWith('temp-')).map(s => s.id)
      );

      // Steps to delete: exist in DB but not in incoming list
      const idsToDelete = [...currentIds].filter(cid => !incomingRealIds.has(cid));

      if (idsToDelete.length > 0) {
        // Only delete if not referenced by instance steps
        await prisma.workflowStep.deleteMany({
          where: {
            id: { in: idsToDelete },
            instances: { none: {} },
          },
        });
        // For referenced steps that need removal, we keep them but they won't be in the updated list
        // (they become orphaned but don't break FK — alternatively could throw error)
      }

      // Upsert each step
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepData = {
          name: step.name,
          description: step.description,
          color: step.color,
          sla: step.sla,
          estimatedHours: step.estimatedHours || null,
          assignedUserId: step.assignedUserId || null,
          order: i,
          type: step.type || 'FORM',
          formSchema: step.formSchema || null,
          config: step.config || null,
        };

        if (step.id && !step.id.startsWith('temp-') && currentIds.has(step.id)) {
          // Update existing step
          await prisma.workflowStep.update({
            where: { id: step.id },
            data: stepData,
          });
        } else {
          // Create new step (temp ID or unknown ID)
          await prisma.workflowStep.create({
            data: { ...stepData, workflowId: id },
          });
        }
      }

      return prisma.workflow.findUnique({
        where: { id },
        include: { steps: { orderBy: { order: 'asc' } } },
      });
    }
    return prisma.workflow.update({
      where: { id },
      data: workflowData,
      include: { steps: { orderBy: { order: 'asc' } } }
    });
  }

  static async delete(id) {
    return prisma.workflow.delete({ where: { id } });
  }

  // --- Workflow Steps ---
  static async addStep(workflowId, data, order) {
    return prisma.workflowStep.create({
      data: { ...data, workflowId, order }
    });
  }

  static async updateStep(id, data) {
    return prisma.workflowStep.update({ where: { id }, data });
  }

  static async deleteStep(id) {
    return prisma.workflowStep.delete({ where: { id } });
  }

  static async reorderSteps(workflowId, stepOrders) {
    const updates = stepOrders.map(({ id, order }) =>
      prisma.workflowStep.update({ where: { id }, data: { order } })
    );
    return prisma.$transaction(updates);
  }

  // --- Workflow Instances ---
  static async createInstance(workflowId, data, userId) {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { steps: { orderBy: { order: 'asc' }, include: { assignedUser: { select: { id: true, fullName: true } } } } }
    });

    if (!workflow) throw new Error('Workflow not found');

    const firstStep = workflow.steps[0];

    const instance = await prisma.workflowInstance.create({
      data: {
        workflowId,
        projectId: data.projectId,
        title: data.title,
        status: 'CREATED',
        currentStepId: firstStep?.id || null,
        steps: {
          create: workflow.steps.map(step => ({
            stepId: step.id,
            status: step === firstStep ? 'IN_PROGRESS' : 'PENDING',
            estimatedHours: step.estimatedHours,
            startedAt: step === firstStep ? new Date() : null,
          }))
        }
      },
      include: {
        steps: { include: { step: true } },
        workflow: true
      }
    });

    // Auto-create task for first step if it has an assigned user
    if (firstStep && firstStep.assignedUserId) {
      await prisma.task.create({
        data: {
          instanceId: instance.id,
          instanceStepId: instance.steps.find(s => s.stepId === firstStep.id)?.id,
          title: `${data.title} - ${firstStep.name}`,
          description: firstStep.description,
          assigneeId: firstStep.assignedUserId,
          priority: 'MEDIUM',
          status: 'TODO',
          estimatedHours: firstStep.estimatedHours,
        }
      });
    }

    return instance;
  }

  static async findAllInstances(query = {}) {
    const { page = 1, limit = 10, status, workflowId, projectId } = query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (workflowId) where.workflowId = workflowId;
    if (projectId) where.projectId = projectId;

    const [instances, total] = await Promise.all([
      prisma.workflowInstance.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          workflow: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
          steps: { include: { step: true }, orderBy: { createdAt: 'asc' } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.workflowInstance.count({ where })
    ]);

    return { instances, total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async findActiveInstanceByProject(projectId) {
    return prisma.workflowInstance.findFirst({
      where: {
        projectId,
        status: { in: ['CREATED', 'IN_PROGRESS', 'WAITING_APPROVAL'] },
      },
      include: {
        workflow: { include: { steps: { orderBy: { order: 'asc' } } } },
        steps: { include: { step: { include: { assignedUser: { select: { id: true, fullName: true, jobTitle: true } } } } }, orderBy: { createdAt: 'asc' } },
        tasks: { include: { assignee: { select: { id: true, fullName: true, avatar: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findInstanceById(id) {
    return prisma.workflowInstance.findUnique({
      where: { id },
      include: {
        workflow: { include: { steps: { orderBy: { order: 'asc' } } } },
        project: true,
        steps: { include: { step: true }, orderBy: { createdAt: 'asc' } },
        tasks: { include: { assignee: { select: { id: true, fullName: true, avatar: true } } } },
        comments: {
          include: { user: { select: { id: true, fullName: true, avatar: true } } },
          orderBy: { createdAt: 'desc' }
        },
        attachments: true
      }
    });
  }

  static async advanceStep(instanceId, stepId, formData, userId) {
    const instance = await prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: { workflow: { include: { steps: { orderBy: { order: 'asc' }, include: { assignedUser: { select: { id: true, fullName: true } } } } } } }
    });

    if (!instance) throw new Error('Instance not found');

    // Complete current step
    await prisma.workflowInstanceStep.updateMany({
      where: { instanceId, stepId },
      data: { status: 'COMPLETED', formData, completedBy: userId, completedAt: new Date() }
    });

    // Find next step
    const steps = instance.workflow.steps;
    const currentIndex = steps.findIndex(s => s.id === stepId);
    const nextStep = steps[currentIndex + 1];

    if (nextStep) {
      await prisma.workflowInstance.update({
        where: { id: instanceId },
        data: { currentStepId: nextStep.id, status: 'IN_PROGRESS' }
      });
      await prisma.workflowInstanceStep.updateMany({
        where: { instanceId, stepId: nextStep.id },
        data: { status: 'IN_PROGRESS', startedAt: new Date() }
      });

      // Auto-create task for next step if it has an assigned user
      if (nextStep.assignedUserId) {
        const instStep = await prisma.workflowInstanceStep.findFirst({
          where: { instanceId, stepId: nextStep.id }
        });
        await prisma.task.create({
          data: {
            instanceId: instanceId,
            instanceStepId: instStep?.id,
            title: `${instance.title} - ${nextStep.name}`,
            description: nextStep.description,
            assigneeId: nextStep.assignedUserId,
            priority: 'MEDIUM',
            status: 'TODO',
            estimatedHours: nextStep.estimatedHours,
          }
        });
      }
    } else {
      await prisma.workflowInstance.update({
        where: { id: instanceId },
        data: { currentStepId: null, status: 'COMPLETED' }
      });
    }

    return this.findInstanceById(instanceId);
  }

  static async rejectStep(instanceId, stepId, userId) {
    await prisma.workflowInstanceStep.updateMany({
      where: { instanceId, stepId },
      data: { status: 'SKIPPED', completedBy: userId, completedAt: new Date() }
    });

    return prisma.workflowInstance.update({
      where: { id: instanceId },
      data: { status: 'REJECTED' }
    });
  }
}

module.exports = WorkflowService;
