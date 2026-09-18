CREATE TABLE `cooperative_harvests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`levelId` int NOT NULL,
	`participantId` int NOT NULL,
	`recipientUserId` int NOT NULL,
	`amount` int NOT NULL,
	`status` enum('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
	`paymentReference` varchar(120),
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`paidAt` timestamp,
	CONSTRAINT `cooperative_harvests_id` PRIMARY KEY(`id`),
	CONSTRAINT `cooperative_harvests_participantId_unique` UNIQUE(`participantId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `accountStatus` enum('active','inactive') DEFAULT 'active' NOT NULL;