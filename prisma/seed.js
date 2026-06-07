const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Permissions
  const permissions = [
    'project.view', 'project.create', 'project.edit', 'project.delete',
    'workflow.view', 'workflow.create', 'workflow.edit', 'workflow.delete',
    'user.view', 'user.create', 'user.edit', 'user.delete',
    'role.view', 'role.edit',
    'task.view', 'task.create', 'task.edit', 'task.delete',
    'organization.view', 'organization.create', 'organization.edit', 'organization.delete'
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { name: p },
      update: {},
      create: { name: p }
    });
  }
  console.log(`✅ Created ${permissions.length} permissions`);

  // 2. Create Roles
  const allPermissions = await prisma.permission.findMany();

  const adminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: {
      name: 'Super Admin',
      permissions: { connect: allPermissions.map(p => ({ id: p.id })) }
    }
  });

  const pmRole = await prisma.role.upsert({
    where: { name: 'Project Manager' },
    update: {},
    create: {
      name: 'Project Manager',
      permissions: {
        connect: allPermissions
          .filter(p => p.name.includes('project') || p.name.includes('workflow') || p.name.includes('task'))
          .map(p => ({ id: p.id }))
      }
    }
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'Staff' },
    update: {},
    create: {
      name: 'Staff',
      permissions: {
        connect: allPermissions
          .filter(p => p.name.endsWith('.view'))
          .map(p => ({ id: p.id }))
      }
    }
  });

  console.log('✅ Created roles');

  // 3. Create Organization
  const org = await prisma.organization.upsert({
    where: { code: 'MAIN' },
    update: {},
    create: {
      name: 'Main Organization',
      code: 'MAIN'
    }
  });
  console.log('✅ Created organization');

  // 4. Create Department
  const dept = await prisma.department.upsert({
    where: { id: 'dept-001' },
    update: {},
    create: {
      id: 'dept-001',
      name: 'Engineering',
      organizationId: org.id
    }
  });

  // 5. Create Team
  const team = await prisma.team.upsert({
    where: { id: 'team-001' },
    update: {},
    create: {
      id: 'team-001',
      name: 'Backend Team',
      departmentId: dept.id
    }
  });

  // 6. Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      fullName: 'Super Admin',
      organizationId: org.id,
      roleId: adminRole.id,
      status: 'ACTIVE'
    }
  });
  console.log('✅ Created admin user (admin@example.com / admin123)');

  // 7. Create Project
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
  const project = await prisma.project.upsert({
    where: { code: 'PROJ-001' },
    update: {},
    create: {
      name: 'Enterprise Project Management',
      code: 'PROJ-001',
      description: 'Building the EPMS platform',
      status: 'ACTIVE',
      priority: 'HIGH',
      organizationId: org.id,
      teamId: team.id,
      ownerId: adminUser.id
    }
  });
  console.log('✅ Created sample project');

  // 8. Create Workflow
  const workflow = await prisma.workflow.create({
    data: {
      name: 'Purchase Request',
      description: 'Standard purchase request approval workflow',
      organizationId: org.id,
      steps: {
        create: [
          { name: 'Request Form', order: 0, type: 'START', color: '#3b82f6' },
          { name: 'Manager Approval', order: 1, type: 'APPROVAL', color: '#f59e0b' },
          { name: 'Finance Approval', order: 2, type: 'APPROVAL', color: '#10b981' },
          { name: 'Procurement', order: 3, type: 'FORM', color: '#8b5cf6' },
          { name: 'Completed', order: 4, type: 'FINISH', color: '#6b7280' }
        ]
      }
    }
  });
  console.log('✅ Created sample workflow');

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('   Email: admin@example.com');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
