import { Metadata } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { Document } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/module.mjs";
import { DropData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/clientDocumentMixin";
import { EquipmentRules } from "../item/item.constant";
import { EquipmentRule } from "../item/item.interface";
import { SYSTEM } from "./constants";

export function getGame(): Game {
  if (!(game instanceof Game)) {
    throw new Error("game is not initialized yet!");
  }
  return game;
}

/**
 * Automatically prepends the key with CRYPTOMANCER.
 */
export function l(key: string): string {
  return getGame().i18n.localize(`CRYPTOMANCER.${key}`);
}

export function log(args: any, force = false) {
  try {
    const isDebugging = (getGame().modules.get("_dev-mode") as any)?.api?.getPackageDebugValue(SYSTEM);

    if (force || isDebugging) {
      if (typeof args === "string") {
        console.log(SYSTEM, "|", args);
      } else {
        console.log(SYSTEM, "|", ...args);
      }
    }
  } catch (e) {}
}

export async function fromCompendium<T extends Document<any, any, Metadata<any>>>(
  compendium: string,
  id: string,
  system = true
): Promise<StoredDocument<T> | undefined> {
  let compendiumKey = system ? `cryptomancer.${compendium}` : compendium;
  const _compendium = getGame().packs.get(compendiumKey);
  if (!_compendium) {
    return;
  }
  const _document = (await _compendium.getDocument(id)) as StoredDocument<T> | null | undefined;
  if (!_document) {
    return;
  }
  return _document;
}

export function getEquipmentRuleByName(ruleName: string): EquipmentRule {
  // Handle rules with values
  if (ruleName.startsWith("Damage")) {
    let damageValue = parseInt(ruleName.replace("Damage", "").replace(/\s/g, ""));
    if (isNaN(damageValue)) {
      damageValue = 0;
      console.warn(`Could not match damage rule value. Setting value to zero.`);
    }
    return { ...EquipmentRules.damage, value: damageValue };
  } else if (ruleName.startsWith("DR")) {
    let drValue = parseInt(ruleName.replace("DR", "").replace(/\s/g, ""));
    if (isNaN(drValue)) {
      drValue = 0;
      console.warn(`Could not match DR rule value. Setting value to zero.`);
    }
    return { ...EquipmentRules.damageReduction, value: drValue };
  } else if (ruleName.startsWith("Slow Reload")) {
    let reloadValue = parseInt(ruleName.replace("Slow Reload", "").replace(/\s/g, ""));
    if (isNaN(reloadValue)) {
      reloadValue = 0;
      console.warn(`Could not match slow reload rule value. Setting value to zero.`);
    }
    return { ...EquipmentRules.slowReload, value: reloadValue };
  }
  // Handle Two-handed
  else if (ruleName === "Two-handed") {
    return { ...EquipmentRules.twoHanded };
  }
  // Handle Station Signifier
  else if (ruleName.startsWith("Station Signifier")) {
    const signifierType = ruleName.replace("Station Signifier", "").replace(/[\s\(\)]/g, "");
    const signifierKey = `stationSignifier${signifierType}`;
    if (Object.keys(EquipmentRules).includes(signifierKey)) {
      return { ...EquipmentRules[signifierKey] };
    } else {
      console.warn(`Could not match rule ${ruleName} to a known station signifier rule.`);
      return {
        key: signifierKey,
        label: ruleName,
        custom: true,
      };
    }
  }
  // Handle misspelled Kinetic...
  else if (ruleName === "Kineteic") {
    return { ...EquipmentRules.kinetic };
  }
  // Migrate by name
  else {
    const keyName = `${ruleName.charAt(0).toLowerCase()}${ruleName.substring(1)}`.replace(/[\s-']/g, "");
    if (Object.keys(EquipmentRules).includes(keyName)) {
      return { ...EquipmentRules[keyName] };
    }
    // Handle custom rules
    else {
      console.warn(`Could not match rule ${ruleName} to a known equipment rule.`);
      return {
        key: keyName,
        label: ruleName,
        custom: true,
      };
    }
  }
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
export async function createItemMacro(data: DropData<Macro>, slot: number) {
  if ((data as any).type !== "Item") return;
  if (!("data" in data)) return ui?.notifications?.warn("You can only create macro buttons for owned Items");
  const item = data.data;

  // Create the macro command
  const command = `game.cryptomancer.rollItemMacro("${item.name}");`;
  let macro = (game as any).macros.find((m: any) => m.name === item.name && m.command === command);
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "cryptomancer.itemMacro": true },
    });
  }
  (game as any).user.assignHotbarMacro(macro, slot);
  return false;
}
