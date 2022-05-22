import { CryptomancerActor } from "../actor/actor";
import { Cell, RiskEvent } from "../actor/actor.interface";
import { SCOPE } from "./constants";
import { getGame } from "./util";

export async function migrateWorld(): Promise<void> {
  const _game = getGame();
  const version = _game.system.data.version;
  ui.notifications?.info(_game.i18n.format("MIGRATION.Begin", { version }), { permanent: true });

  await migrateWorldItems();
  await migrateWorldActors();

  // Set the migration as complete
  _game.settings.set(SCOPE, "systemMigrationVersion", version);
  ui.notifications?.info(_game.i18n.format("MIGRATION.Complete", { version }), { permanent: true });
}

async function migrateWorldActors(): Promise<void> {
  const _game = getGame();
  for (let actor of _game.actors || []) {
    await migrateParty(actor);
  }
}

async function migrateWorldItems(): Promise<void> {
  const _game = getGame();
  for (let item of _game.items || []) {
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
}

async function migrateParty(party: StoredDocument<CryptomancerActor>): Promise<void> {
  if (party.data.type !== "party") {
    return;
  }

  const updateData: any = {};

  // Migrate risk events from number indexed objects to array
  if (!Array.isArray(party.data.data.riskEvents)) {
    console.log(`Migrating party ${party.name} risk events.`);
    updateData["data.riskEvents"] = Object.values(party.data.data.riskEvents) as RiskEvent[];
  }

  // Migrate cells from number indexed objects to array
  if (!Array.isArray(party.data.data.cells)) {
    console.log(`Migrating party ${party.name} cells.`);
    updateData["data.cells"] = Object.values(party.data.data.cells) as Cell[];
  }

  // Apply update
  if (!foundry.utils.isObjectEmpty(updateData)) {
    await party.update(updateData, { enforceTypes: false });
  }
}
