// Foundry
import { DropData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/clientDocumentMixin";

import { CryptomancerActor } from "./actor/actor";
import { CryptomancerActorSheet } from "./actor-sheet/actor-sheet";
import { preloadHandlebarsTemplates } from "./shared/templates";
import { SettingsService } from "./settings/settings.service";
import { SkillCheckService } from "./skill-check/skill-check.service";
import { CryptomancerItem } from "./item/item";
import { CryptomancerItemSheet } from "./item-sheet/item-sheet";
import { getGame, l } from "./shared/util";
import { SpellType } from "./item/item.enum";
import { CoreAlt } from "./actor/actor.interface";
import { SCOPE } from "./shared/constants";
import { migrateWorld } from "./shared/migrations";
import "./cryptomancer.scss";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", async function () {
  const settingsService = new SettingsService();

  // Define custom Document classes
  CONFIG.Actor.documentClass = CryptomancerActor;
  CONFIG.Item.documentClass = CryptomancerItem;

  // Register settings
  settingsService.registerSettings();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet(SCOPE, CryptomancerActorSheet, {
    makeDefault: true,
    label: "CRYPTOMANCER.SheetType.character",
    types: ["character"],
  });
  Actors.registerSheet(SCOPE, CryptomancerActorSheet, {
    makeDefault: true,
    label: "CRYPTOMANCER.SheetType.party",
    types: ["party"],
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet(SCOPE, CryptomancerItemSheet, {
    makeDefault: true,
    label: "CRYPTOMANCER.SheetType.talent",
    types: ["talent"],
  });
  Items.registerSheet(SCOPE, CryptomancerItemSheet, {
    makeDefault: true,
    label: "CRYPTOMANCER.SheetType.spell",
    types: ["spell"],
  });
  Items.registerSheet(SCOPE, CryptomancerItemSheet, {
    makeDefault: true,
    label: "CRYPTOMANCER.SheetType.equipment",
    types: ["equipment"],
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// General Helpers
Handlebars.registerHelper("is", (source: unknown, target: unknown) => {
  return source === target;
});

Handlebars.registerHelper("or", (a: any, b: any, options: Handlebars.HelperOptions) => {
  if ([a, b].some((value) => Boolean(value))) {
    return options.fn(true);
  }
});

Handlebars.registerHelper("ne", (source: unknown, target: unknown) => {
  return source !== target;
});

Handlebars.registerHelper("lt", (a: any, b: any) => {
  return a < b;
});

Handlebars.registerHelper("add", (a: number, b: number) => {
  return a + b;
});

Handlebars.registerHelper("times", (context: number, options: Handlebars.HelperOptions) => {
  let ret = "";

  for (let i = 0; i < context; i++) {
    ret = ret + options.fn(i);
  }

  return ret;
});

Handlebars.registerHelper("concat", function () {
  var outStr = "";
  for (var arg in arguments) {
    if (typeof arguments[arg] != "object") {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper("safe", (arg: string) => {
  return new Handlebars.SafeString(arg);
});

Handlebars.registerHelper("toLowerCase", (input: string) => {
  return input.toLowerCase();
});

Handlebars.registerHelper("toUpperCase", (input: string) => {
  return input.toUpperCase();
});

Handlebars.registerHelper("l", (key: string) => {
  return l(key);
});

Handlebars.registerHelper("firstHalf", (array: any[]) => {
  if (!array || array.length === 0) {
    return [];
  }
  return array.slice(0, Math.floor(array.length / 2));
});

Handlebars.registerHelper("lastHalf", (array: any[]) => {
  if (!array || array.length === 0) {
    return [];
  }
  return array.slice(Math.floor(array.length / 2));
});

// Sheet Specific Helpers
Handlebars.registerHelper("localizeSpellType", (type: SpellType) => {
  return l(`SpellType.${type}`);
});

Handlebars.registerHelper("chatCardSpellType", (type: SpellType) => {
  return type === SpellType.Cantrip ? l(`SpellType.cantrip`) : l(`SpellType.${type}Spell`);
});

Handlebars.registerHelper("noSkillAttribute", (core: CoreAlt, options: Handlebars.HelperOptions) => {
  if (core.key === "resolve") {
    return options.fn(core.attributes["willpower"]);
  } else if (core.key === "power") {
    return options.fn(core.attributes["endurance"]);
  } else {
    return;
  }
});

/**
 * Lookup and localize the short version of an attribute name
 */
Handlebars.registerHelper("shortAttr", (attribute: string) => {
  return l(`ShortAttr.${attribute}`);
});

/**
 * Return a string showing whether an item is masterwork or trademark
 */
Handlebars.registerHelper("itemAttrs", (item: CryptomancerItem) => {
  if (item.data.type !== "equipment") {
    return;
  }
  const output: string[] = [];
  if (item.data.data.masterwork) {
    output.push(l("Equipment.masterworkShort"));
  }
  if (item.data.data.trademark) {
    output.push(l("Equipment.trademarkShort"));
  }
  if (output.length > 0) {
    return `(${output.join(", ")})`;
  }
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (_bar, data, slot) => createItemMacro(data, slot));

  // Determine whether a system migration is required and feasible
  const game = getGame();
  if (!game.user?.isGM) return;
  const alwaysMigrate = (game.modules.get("_dev-mode") as any | undefined)?.api?.getPackageDebugValue("cryptomancer");
  const currentVersion = game.settings.get(SCOPE, "systemMigrationVersion") as string;
  // Migrate if the last installed version is LESS than this value
  // So when updating this value, it should be set to the NEWEST version
  const NEEDS_MIGRATION_VERSION = "0.6.1";
  const COMPATIBLE_MIGRATION_VERSION = "0.1.0";
  const needsMigration = !currentVersion || isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion);
  if (!needsMigration && !alwaysMigrate) return;

  // Perform the migration
  if (currentVersion && isNewerVersion(COMPATIBLE_MIGRATION_VERSION, currentVersion)) {
    ui.notifications?.error(game.i18n.localize("MIGRATION.VersionTooOldWarning"), { permanent: true });
  }
  migrateWorld();
});

Hooks.once("devModeReady", ({ registerPackageDebugFlag }: any) => {
  registerPackageDebugFlag("cryptomancer");
});

/**
 * Chat message render hook. Used to bind the
 * buttons in each skill check chat message to
 * update the check difficulty.
 */
Hooks.on("renderChatMessage", (message: ChatMessage, html: JQuery<HTMLElement>) => {
  // Bind raise/lower difficulty buttons to skill check messages
  SkillCheckService.bindMessage(message, html);

  // Apply a css class to the message if it is configured in a flag
  const cssClass = message.getFlag("cryptomancer", "cssClass") as string | null;
  if (cssClass) {
    html.addClass(cssClass);
  }
});

/**
 * Don't allow the creation of trademark items.
 * DEPRECATED Remove this in 1.0.0
 */
Hooks.on("renderDialog", (_: Dialog, html: JQuery<HTMLElement>) => {
  Array.from(html.find<HTMLOptionElement>("#document-create option")).forEach((option) => {
    if (option.value === "trademarkItem") {
      option.remove();
    }
  });
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data: DropData<Macro>, slot: number) {
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

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName: string) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = (game as any).actors.tokens[speaker.token];
  if (!actor) actor = (game as any).actors.get(speaker.actor);
  const item = actor ? actor.items.find((i: Item) => i.name === itemName) : null;
  if (!item) return ui?.notifications?.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trigger the item roll
  return item.roll();
}
