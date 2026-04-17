CREATE TABLE `jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'pending',
	`created` integer DEFAULT (CAST(unixepoch('now', 'subsec') * 1000 AS INTEGER)),
	`updated` integer DEFAULT (CAST(unixepoch('now', 'subsec') * 1000 AS INTEGER))
);
