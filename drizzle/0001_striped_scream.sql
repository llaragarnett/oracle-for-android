CREATE TABLE `familyMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` varchar(64) NOT NULL,
	`avatar` text,
	`relationshipContext` text,
	`isRootAdmin` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `familyMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `familyTree` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentMemberId` int,
	`childMemberId` int NOT NULL,
	`relationshipType` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `familyTree_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generatedArtworks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`familyMemberId` int NOT NULL,
	`prompt` text NOT NULL,
	`imageUrl` text NOT NULL,
	`model` varchar(64) DEFAULT 'stable-diffusion',
	`seed` varchar(255),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generatedArtworks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`familyMemberId` int,
	`content` text NOT NULL,
	`embedding` json,
	`importance` int DEFAULT 5,
	`tags` json,
	`isPrivate` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` varchar(64) NOT NULL,
	`familyMemberId` int NOT NULL,
	`sender` enum('user','oracle') NOT NULL,
	`content` text NOT NULL,
	`imageUrl` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `phoenixTraits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`traitName` varchar(255) NOT NULL,
	`traitValue` text NOT NULL,
	`category` varchar(64),
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `phoenixTraits_id` PRIMARY KEY(`id`),
	CONSTRAINT `phoenixTraits_traitName_unique` UNIQUE(`traitName`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`familyMemberId` int NOT NULL,
	`theme` varchar(64) DEFAULT 'classic',
	`ollamaUrl` text,
	`ollamaModel` varchar(255) DEFAULT 'dolphin-llama3',
	`autoSync` boolean DEFAULT true,
	`syncInterval` int DEFAULT 30000,
	`enableVoiceInput` boolean DEFAULT true,
	`enableVisionInput` boolean DEFAULT true,
	`enableImageGeneration` boolean DEFAULT true,
	`cacheSize` int DEFAULT 1000,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `syncLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`familyMemberId` int NOT NULL,
	`deviceId` varchar(255) NOT NULL,
	`lastSyncTime` timestamp NOT NULL DEFAULT (now()),
	`messagesSynced` int DEFAULT 0,
	`memoriesSynced` int DEFAULT 0,
	`status` enum('success','pending','failed') DEFAULT 'success',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `syncLog_id` PRIMARY KEY(`id`)
);
