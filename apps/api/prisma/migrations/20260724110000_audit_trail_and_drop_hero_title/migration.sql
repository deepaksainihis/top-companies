-- DropColumn
ALTER TABLE `categories` DROP COLUMN `heroTitle`;

-- AlterTable: admins
ALTER TABLE `admins`
  ADD COLUMN `createdById` INTEGER NULL,
  ADD COLUMN `updatedById` INTEGER NULL;

-- AlterTable: countries
ALTER TABLE `countries`
  ADD COLUMN `createdById` INTEGER NULL,
  ADD COLUMN `updatedById` INTEGER NULL,
  ADD COLUMN `deletedById` INTEGER NULL;

-- AlterTable: tech_stacks
ALTER TABLE `tech_stacks`
  ADD COLUMN `createdById` INTEGER NULL,
  ADD COLUMN `updatedById` INTEGER NULL,
  ADD COLUMN `deletedById` INTEGER NULL;

-- AlterTable: employee_ranges
ALTER TABLE `employee_ranges`
  ADD COLUMN `createdById` INTEGER NULL,
  ADD COLUMN `updatedById` INTEGER NULL,
  ADD COLUMN `deletedById` INTEGER NULL;

-- AlterTable: hourly_rate_ranges
ALTER TABLE `hourly_rate_ranges`
  ADD COLUMN `createdById` INTEGER NULL,
  ADD COLUMN `updatedById` INTEGER NULL,
  ADD COLUMN `deletedById` INTEGER NULL;

-- AlterTable: companies
ALTER TABLE `companies`
  ADD COLUMN `createdById` INTEGER NULL,
  ADD COLUMN `updatedById` INTEGER NULL,
  ADD COLUMN `deletedById` INTEGER NULL;

-- AlterTable: categories
ALTER TABLE `categories`
  ADD COLUMN `createdById` INTEGER NULL,
  ADD COLUMN `updatedById` INTEGER NULL,
  ADD COLUMN `deletedById` INTEGER NULL;

-- AlterTable: settings
ALTER TABLE `settings`
  ADD COLUMN `updatedById` INTEGER NULL;

-- AlterTable: seo_meta
ALTER TABLE `seo_meta`
  ADD COLUMN `updatedById` INTEGER NULL;
