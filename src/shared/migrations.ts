import { SCOPE } from "./constants";
import { getGame } from "./util";

export async function migrateWorld() {
  const game = getGame();
  const version = game.system.data.version;
  ui.notifications?.info(game.i18n.format("MIGRATION.Begin", { version }), { permanent: true });

  // Migrate World Items
  for (let item of game.items || []) {
    // Migrate trademark items to equipment
    if (item.data.type === "trademarkItem") {
      console.log(`Migrating trademark item ${item.name} to equipment.`);
      item.update(
        {
          type: "equipment",
          data: {
            trademark: true,
          },
        },
        { enforceTypes: false }
      );
    }
  }

  // Set the migration as complete
  game.settings.set(SCOPE, "systemMigrationVersion", version);
  ui.notifications?.info(game.i18n.format("MIGRATION.Complete", { version }), { permanent: true });
}
