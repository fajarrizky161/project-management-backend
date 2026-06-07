const prisma = require('../../shared/utils/prisma');

class ProjectService {
  static async create(data, userId) {
    const { workflowTemplateId, startDate, dueDate, ...projectData } = data;

    const createData = { ...projectData, ownerId: userId };
    if (startDate) createData.startDate = new Date(startDate);
    if (dueDate) createData.dueDate = new Date(dueDate);

    const project = await prisma.project.create({
      data: createData,
      include: { owner: { select: { id: true, fullName: true, email: true } }, team: true }
    });

    // Auto-create workflow instance from template
    if (workflowTemplateId) {
      const template = await prisma.workflow.findUnique({
        where: { id: workflowTemplateId },
        include: { steps: { orderBy: { order: 'asc' } } },
      });

      if (template) {
        const instance = await prisma.workflowInstance.create({
          data: {
            workflowId: template.id,
            projectId: project.id,
            title: project.name,
            status: 'CREATED',
            currentStepId: template.steps[0]?.id || null,
            steps: {
              create: template.steps.map(step => ({
                stepId: step.id,
                status: step === template.steps[0] ? 'IN_PROGRESS' : 'PENDING',
                estimatedHours: step.estimatedHours,
                startedAt: step === template.steps[0] ? new Date() : null,
              })),
            },
          },
          include: {
            steps: { include: { step: true }, orderBy: { createdAt: 'asc' } },
            workflow: true,
          },
        });

        // Auto-create task for first step if assigned
        const firstStep = template.steps[0];
        if (firstStep?.assignedUserId) {
          const instStep = instance.steps.find(s => s.stepId === firstStep.id);
          await prisma.task.create({
            data: {
              instanceId: instance.id,
              instanceStepId: instStep?.id,
              title: `${project.name} - ${firstStep.name}`,
              description: firstStep.description,
              assigneeId: firstStep.assignedUserId,
              priority: 'MEDIUM',
              status: 'TODO',
              estimatedHours: firstStep.estimatedHours,
            },
          });
        }
      }
    }

    return project;
  }

  static async findAll(query = {}) {
    const { page = 1, limit = 10, status, organizationId, search } = query;
    const skip = (page - 1) * limit;

    const where = {};
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          owner: { select: { id: true, fullName: true, avatar: true } },
          team: true,
          workflowTemplate: { select: { id: true, name: true } },
          _count: { select: { instances: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);

    return { projects, total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async findById(id) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, fullName: true, email: true, avatar: true } },
        team: true,
        workflowTemplate: { select: { id: true, name: true } },
        instances: {
          orderBy: { createdAt: 'desc' },
          include: {
            workflow: { select: { id: true, name: true } },
            steps: {
              include: { step: true },
              orderBy: { createdAt: 'asc' },
            },
            _count: { select: { tasks: true } },
          },
        },
      },
    });
  }

  static async update(id, data) {
    const { startDate, dueDate, ...rest } = data;
    const updateData = { ...rest };
    if (startDate) updateData.startDate = new Date(startDate);
    if (dueDate) updateData.dueDate = new Date(dueDate);
    return prisma.project.update({
      where: { id },
      data: updateData,
      include: { owner: { select: { id: true, fullName: true } }, team: true },
    });
  }

  static async delete(id) {
    return prisma.project.delete({ where: { id } });
  }
}

module.exports = ProjectService;
