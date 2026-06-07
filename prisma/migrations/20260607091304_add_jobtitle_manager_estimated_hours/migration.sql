-- AlterTable
ALTER TABLE `task` ADD COLUMN `actualHours` DOUBLE NULL,
    ADD COLUMN `estimatedHours` DOUBLE NULL,
    ADD COLUMN `instanceStepId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `jobTitle` VARCHAR(191) NULL,
    ADD COLUMN `managerId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `workflowinstancestep` ADD COLUMN `actualHours` DOUBLE NULL,
    ADD COLUMN `estimatedHours` DOUBLE NULL,
    ADD COLUMN `startedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `workflowstep` ADD COLUMN `assignedUserId` VARCHAR(191) NULL,
    ADD COLUMN `estimatedHours` DOUBLE NULL,
    MODIFY `type` ENUM('START', 'FORM', 'APPROVAL', 'CONDITION', 'NOTIFICATION', 'FINISH') NOT NULL DEFAULT 'FORM';

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkflowStep` ADD CONSTRAINT `WorkflowStep_assignedUserId_fkey` FOREIGN KEY (`assignedUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
