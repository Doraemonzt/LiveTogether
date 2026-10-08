CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `interactions` (
	`id` text PRIMARY KEY NOT NULL,
	`video_id` text NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`text` text NOT NULL,
	`at` integer,
	`status` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `interactions_video` ON `interactions` (`video_id`);--> statement-breakpoint
CREATE INDEX `interactions_user` ON `interactions` (`user_id`);--> statement-breakpoint
CREATE TABLE `videos` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`session_id` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `videos_session` ON `videos` (`session_id`);--> statement-breakpoint
CREATE INDEX `videos_owner` ON `videos` (`owner`);