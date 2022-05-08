import { SCOPE } from "./constants";
import { getGame } from "./util";

export async function migrateWorld() {
  const game = getGame();
  const version = game.system.data.version;
  ui.notifications?.info(game.i18n.format("MIGRATION.Begin", { version }), { permanent: true });

  // Migrate World Items
  for (let item of game.items || []) {
    const updateData: any = {};
    // Migrate trademark items to equipment
    if (item.data.type === "trademarkItem") {
      console.log(`Migrating trademark item ${item.name} to equipment.`);
      updateData["type"] = "equipment";
      updateData["data.trademark"] = true;
    }

    // Migrate equipment qualities and rules to array
    if (item.data.type === "trademarkItem" || item.data.type === "equipment") {
      if (!Array.isArray(item.data.data.qualities)) {
        console.log(`Migrating item ${item.name} qualities.`);
        // Migrate string data to array if possible
        if (typeof item.data.data.qualities === "string" && item.data.data.qualities !== "") {
          updateData["data.qualities"] = (item.data.data.qualities as string).split(",");
        } else {
          updateData["data.qualities"] = [];
        }
      }

      if (!Array.isArray(item.data.data.rules)) {
        console.log(`Migrating item ${item.name} rules.`);
        // Migrate string data to array if possible
        if (typeof item.data.data.rules === "string" && item.data.data.rules !== "") {
          updateData["data.rules"] = (item.data.data.rules as string).split(",");
        } else {
          updateData["data.rules"] = [];
        }
      }
    }

    // Apply update
    if (!foundry.utils.isObjectEmpty(updateData)) {
      await item.update(updateData, { enforceTypes: false });
    }
  }

  // Set the migration as complete
  game.settings.set(SCOPE, "systemMigrationVersion", version);
  ui.notifications?.info(game.i18n.format("MIGRATION.Complete", { version }), { permanent: true });
}
