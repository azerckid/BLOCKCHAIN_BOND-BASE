-- choonsim_projects에 bond_id 추가 (다중 캐릭터 지원, 07_MULTI_CHARACTER_BOND_SPEC)
ALTER TABLE `choonsim_projects` ADD COLUMN `bond_id` integer;
--> statement-breakpoint
CREATE UNIQUE INDEX `choonsim_projects_bond_id_unique` ON `choonsim_projects` (`bond_id`);
