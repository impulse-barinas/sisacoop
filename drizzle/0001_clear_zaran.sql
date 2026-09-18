CREATE TABLE `cooperative_levels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`levelNumber` int NOT NULL,
	`status` enum('locked','available','active','completed') NOT NULL DEFAULT 'locked',
	`seedAmount` int NOT NULL DEFAULT 200,
	`cultivationAmount` int NOT NULL DEFAULT 1000,
	`harvestAmount` int NOT NULL DEFAULT 12000,
	`participantCount` int NOT NULL DEFAULT 12,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cooperative_levels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cooperative_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`levelId` int NOT NULL,
	`userId` int,
	`position` int NOT NULL,
	`status` enum('reserved','active','paid','withdrawn') NOT NULL DEFAULT 'reserved',
	`accountNumber` varchar(24),
	`cultivationAmount` int NOT NULL DEFAULT 1000,
	`registeredAt` timestamp NOT NULL DEFAULT (now()),
	`activatedAt` timestamp,
	CONSTRAINT `cooperative_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cooperative_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`levelId` int NOT NULL,
	`senderUserId` int,
	`receiverUserId` int,
	`direction` enum('sent','received') NOT NULL,
	`amount` int NOT NULL,
	`status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
	`proofKey` varchar(255),
	`proofUrl` varchar(500),
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `cooperative_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cooperative_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accountNumber` varchar(24) NOT NULL,
	`fullName` varchar(160) NOT NULL,
	`phone` varchar(32),
	`bank` varchar(100),
	`identityNumber` varchar(32),
	`mobileNumber` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cooperative_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `cooperative_profiles_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `cooperative_profiles_accountNumber_unique` UNIQUE(`accountNumber`)
);
