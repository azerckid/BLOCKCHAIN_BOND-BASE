CREATE TABLE `bonds` (
	`id` text PRIMARY KEY NOT NULL,
	`bond_id` integer,
	`borrower_name` text NOT NULL,
	`region` text NOT NULL,
	`loan_amount` integer NOT NULL,
	`interest_rate` integer NOT NULL,
	`maturity_date` integer NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `investments` (
	`id` text PRIMARY KEY NOT NULL,
	`investor_id` text NOT NULL,
	`bond_id` text NOT NULL,
	`token_amount` integer NOT NULL,
	`usdc_amount` integer NOT NULL,
	`transaction_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`investor_id`) REFERENCES `investors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bond_id`) REFERENCES `bonds`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `investors` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_address` text NOT NULL,
	`kyc_status` text DEFAULT 'NOT_STARTED' NOT NULL,
	`auto_reinvest` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `investors_wallet_address_unique` ON `investors` (`wallet_address`);--> statement-breakpoint
CREATE TABLE `repayments` (
	`id` text PRIMARY KEY NOT NULL,
	`bond_id` text NOT NULL,
	`amount` integer NOT NULL,
	`repayment_date` integer NOT NULL,
	`oracle_request_id` text,
	FOREIGN KEY (`bond_id`) REFERENCES `bonds`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `yield_distributions` (
	`id` text PRIMARY KEY NOT NULL,
	`bond_id` text NOT NULL,
	`investor_id` text NOT NULL,
	`yield_amount` integer NOT NULL,
	`transaction_hash` text,
	`distributed_at` integer NOT NULL,
	FOREIGN KEY (`bond_id`) REFERENCES `bonds`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`investor_id`) REFERENCES `investors`(`id`) ON UPDATE no action ON DELETE no action
);
