-- AlterTable
ALTER TABLE `companies` ADD COLUMN `score` DOUBLE NULL;

-- AlterTable
ALTER TABLE `settings` ADD COLUMN `aboutContent` LONGTEXT NULL;

-- CreateIndex
CREATE INDEX `companies_score_idx` ON `companies`(`score`);
