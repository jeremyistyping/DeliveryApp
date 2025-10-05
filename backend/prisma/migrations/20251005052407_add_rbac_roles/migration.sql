-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('MAIN_ADMIN', 'GENERAL_ADMIN', 'USER', 'MERCHANT', 'ADMIN', 'OWNER') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `merchants` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `businessName` VARCHAR(191) NOT NULL,
    `businessType` VARCHAR(191) NOT NULL,
    `address` TEXT NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `postalCode` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `merchants_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `merchantId` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `recipientName` VARCHAR(191) NOT NULL,
    `recipientPhone` VARCHAR(191) NOT NULL,
    `recipientAddress` TEXT NOT NULL,
    `recipientCity` VARCHAR(191) NOT NULL,
    `recipientProvince` VARCHAR(191) NOT NULL,
    `recipientPostalCode` VARCHAR(191) NOT NULL,
    `courier` ENUM('JNE', 'TIKI', 'POS', 'NINJA', 'SICEPAT', 'ANTERAJA') NOT NULL,
    `service` VARCHAR(191) NOT NULL,
    `weight` DOUBLE NOT NULL,
    `length` DOUBLE NOT NULL,
    `width` DOUBLE NOT NULL,
    `height` DOUBLE NOT NULL,
    `itemName` VARCHAR(191) NOT NULL,
    `itemValue` DOUBLE NOT NULL,
    `paymentMethod` ENUM('COD', 'PREPAID') NOT NULL,
    `codAmount` DOUBLE NULL,
    `shippingCost` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `trackingNumber` VARCHAR(191) NULL,
    `printCount` INTEGER NOT NULL DEFAULT 0,
    `lastPrintedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_orderNumber_key`(`orderNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tracking_history` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `city` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cod_records` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'COLLECTED', 'REMITTED', 'SETTLED') NOT NULL DEFAULT 'PENDING',
    `collectedAt` DATETIME(3) NULL,
    `remittedAt` DATETIME(3) NULL,
    `settledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cod_records_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `returns` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('REQUESTED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'REQUESTED',
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approvedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `returns_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipping_rates` (
    `id` VARCHAR(191) NOT NULL,
    `courier` ENUM('JNE', 'TIKI', 'POS', 'NINJA', 'SICEPAT', 'ANTERAJA') NOT NULL,
    `service` VARCHAR(191) NOT NULL,
    `origin` VARCHAR(191) NOT NULL,
    `destination` VARCHAR(191) NOT NULL,
    `weight` DOUBLE NOT NULL,
    `cost` DOUBLE NOT NULL,
    `etd` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `merchants` ADD CONSTRAINT `merchants_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `merchants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tracking_history` ADD CONSTRAINT `tracking_history_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cod_records` ADD CONSTRAINT `cod_records_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `returns` ADD CONSTRAINT `returns_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
