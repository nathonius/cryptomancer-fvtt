import { CryptomancerActor } from "../actor/actor";
import { Cell, Core, ResourceAttribute, RiskEvent, Skill } from "../actor/actor.interface";
import { CryptomancerItem } from "../item/item";
import { EquipmentRules } from "../item/item.constant";
import { EquipmentType } from "../item/item.enum";
import { EquipmentRule } from "../item/item.interface";
import { SCOPE } from "./constants";
import { getEquipmentRuleByName, getGame } from "./util";

type DeprecatedSkill = Skill & { skillBreak?: boolean; skillPush?: boolean };
type DeprecatedAttribute = ResourceAttribute & { skills: Record<string, DeprecatedSkill> };
type DeprecatedCore = Core & { attributes: Record<string, DeprecatedAttribute> };

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
    await migrateCharacter(actor);
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

    migrateEquipmentQualitiesAndRules(item, updateData);

    // Apply update
    if (!foundry.utils.isObjectEmpty(updateData)) {
      await item.update(updateData, { enforceTypes: false });
      console.log(`Migrated item ${item.name}.`);
    }
  }
}

function migrateEquipmentQualitiesAndRules(item: StoredDocument<CryptomancerItem>, updateData: any): void {
  if (item.data.type !== "trademarkItem" && item.data.type !== "equipment") {
    return;
  }

  // Migrate equipment qualities to array
  if (!Array.isArray(item.data.data.qualities)) {
    console.log(`Migrating item ${item.name} qualities.`);
    // Migrate string data to array if possible
    if (typeof item.data.data.qualities === "string" && item.data.data.qualities !== "") {
      updateData["data.qualities"] = (item.data.data.qualities as string).split(",");
    } else {
      updateData["data.qualities"] = [];
    }
  }

  // Migrate equipment rules to EquipmentRules
  if (Array.isArray(item.data.data.rules) || typeof item.data.data.rules === "string") {
    console.log(`Migrating item ${item.name} rules.`);
    const newRules: Record<string, EquipmentRule> = {};
    let arrayRules: string[] = item.data.data.rules;
    // First migrate single string to array of rules
    if (typeof item.data.data.rules === "string") {
      arrayRules = (item.data.data.rules as string).split(",").map((rule) => rule.trim());
    }

    // Migrate rules by name
    arrayRules.forEach((ruleName) => {
      if (item.data.type !== "equipment" && item.data.type !== "trademarkItem") {
        return;
      }
      const rule = getEquipmentRuleByName(ruleName);
      newRules[rule.key] = rule;
    });
    updateData["data.rules"] = newRules;
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

async function migrateCharacter(character: StoredDocument<CryptomancerActor>): Promise<void> {
  if (character.data.type !== "character") {
    return;
  }

  const updateData: any = {};

  Object.values(character.data.data.core).forEach((core) => {
    if ((core as DeprecatedCore).attributes) {
      Object.values((core as DeprecatedCore).attributes).forEach((attr) => {
        updateData[`data.attributes.${attr.key}.value`] = attr.value;
        if (attr.break !== undefined) {
          updateData[`data.attributes.${attr.key}.break`] = attr.break;
        }
        if (attr.push !== undefined) {
          updateData[`data.attributes.${attr.key}.push`] = attr.push;
        }
        if (attr.skills) {
          Object.values(attr.skills).forEach((skill) => {
            // These might be really old deprecated skills, do those migrations first
            if ((skill.key as string) === "preciseMissile") {
              skill.key = "preciseMelee";
            }
            updateData[`data.skills.${skill.key}.break`] = skill.break;
            updateData[`data.skills.${skill.key}.push`] = skill.push;

            // These also might have skillBreak instead of break, skillPush instead of push
            // Favor those values
            if (skill.skillBreak !== undefined) {
              updateData[`data.skills.${skill.key}.break`] = skill.skillBreak;
            }
            if (skill.skillPush !== undefined) {
              updateData[`data.skills.${skill.key}.push`] = skill.skillPush;
            }
          });
        }
      });

      // Delete the old stuff
      updateData[`data.core.${core.key}.-=attributes`] = null;
    }
  });

  // Apply update
  if (!foundry.utils.isObjectEmpty(updateData)) {
    console.log(`Migrating character ${character.name}.`);
    await character.update(updateData, { enforceTypes: false });
  }
}
