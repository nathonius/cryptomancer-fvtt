import { createItemMacro, getGame } from "../util";
import { migrateWorld } from "../migrations";
import { SYSTEM } from "../constants";

export function ready(): void {
  const _game = getGame();

  // TODO: Figure out what this does.
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (_bar, data, slot) => createItemMacro(data, slot));

  // Determine whether a system migration is required and feasible
  if (!_game.user?.isGM) return;
  const alwaysMigrate = (_game.modules.get("_dev-mode") as any | undefined)?.api?.getPackageDebugValue(SYSTEM);
  const currentVersion = _game.settings.get(SYSTEM, "systemMigrationVersion") as string;
  // Migrate if the last installed version is LESS than this value
  // So when updating this value, it should be set to the NEWEST version
  const NEEDS_MIGRATION_VERSION = "0.8.1";
  const COMPATIBLE_MIGRATION_VERSION = "0.1.0";
  const needsMigration = !currentVersion || isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion);
  if (!needsMigration && !alwaysMigrate) return;

  // Perform the migration
  if (currentVersion && isNewerVersion(COMPATIBLE_MIGRATION_VERSION, currentVersion)) {
    ui.notifications?.error(_game.i18n.localize("MIGRATION.VersionTooOldWarning"), { permanent: true });
  }

  migrateWorld();
}
