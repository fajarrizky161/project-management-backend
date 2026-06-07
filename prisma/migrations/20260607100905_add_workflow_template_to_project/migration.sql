-- AlterTable
ALTER TABLE `project` ADD COLUMN `workflowTemplateId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_workflowTemplateId_fkey` FOREIGN KEY (`workflowTemplateId`) REFERENCES `Workflow`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
