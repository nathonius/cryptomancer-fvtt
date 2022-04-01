// Foundry
import { DropData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/clientDocumentMixin";

// Import document classes.
import { CryptomancerActor } from "./actor/actor.js";
// Import sheet classes.
import { CryptomancerActorSheet } from "./actor-sheet/actor-sheet.js";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./shared/templates.js";
import { SettingsService } from "./settings/settings.service.js";
import { SkillCheckService } from "./skill-check/skill-check.service.js";
import { CryptomancerItem } from "./item/item.js";
import { CryptomancerItemSheet } from "./item-sheet/item-sheet.js";
import { l } from "./shared/util.js";
import { SpellType } from "./shared/enums/item.js";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", async function () {
  const settingsService = new SettingsService();

  const _game = game as Game;

  // TODO: Are these actually being used? Remove them if not. This seems hacky.
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  (game as any).cryptomancer = {
    CryptomancerActor,
    rollItemMacro,
  };

  // TODO: What would I put in config? I have no idea. Figure out what this is good for.
  // Add custom constants for configuration.
  // CONFIG.BOILERPLATE = BOILERPLATE;

  // TODO: Can I just remove this?
  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d20 + @abilities.dex.mod",
    decimals: 2,
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = CryptomancerActor;
  CONFIG.Item.documentClass = CryptomancerItem;

  // Register settings
  settingsService.registerSettings();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("cryptomancer", CryptomancerActorSheet, {
    makeDefault: true,
    label: l("SheetType.character"),
    types: ["character"],
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("cryptomancer", CryptomancerItemSheet, {
    makeDefault: true,
    label: "CRYPTOMANCER.SheetType.talent",
    types: ["talent"],
  });
  Items.registerSheet("cryptomancer", CryptomancerItemSheet, {
    label: "CRYPTOMANCER.SheetType.spell",
    types: ["spell"],
  });
  Items.registerSheet("cryptomancer", CryptomancerItemSheet, {
    label: "CRYPTOMANCER.SheetType.trademarkItem",
    types: ["trademarkItem"],
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

/**
 * TODO: Figure out if this is actually required. or if there's
 * a built-in way to check equality. I hate handlebars. :(
 */
Handlebars.registerHelper("is", (source: unknown, target: unknown) => {
  return source === target;
});

Handlebars.registerHelper("lt", (a: any, b: any) => {
  return a < b;
});

Handlebars.registerHelper("add", (a: number, b: number) => {
  return a + b;
});

Handlebars.registerHelper("localizeSpellType", (type: SpellType) => {
  return l(`SpellType.${type}`);
});

Handlebars.registerHelper(
  "times",
  (context: number, options: Handlebars.HelperOptions) => {
    let ret = "";

    for (let i = 0; i < context; i++) {
      ret = ret + options.fn(i);
    }

    return ret;
  }
);

// If you need to add Handlebars helpers, here are a few useful examples:
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

Handlebars.registerHelper("toLowerCase", function (str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/**
 * Chat message render hook. Used to bind the
 * buttons in each skill check chat message to
 * update the check difficulty.
 */
Hooks.on(
  "renderChatMessage",
  (message: ChatMessage, html: JQuery<HTMLElement>) => {
    SkillCheckService.bindMessage(message, html);
  }
);

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
  if (!("data" in data))
    return ui?.notifications?.warn(
      "You can only create macro buttons for owned Items"
    );
  const item = data.data;

  // Create the macro command
  const command = `game.cryptomancer.rollItemMacro("${item.name}");`;
  let macro = (game as any).macros.find(
    (m: any) => m.name === item.name && m.command === command
  );
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
  const item = actor
    ? actor.items.find((i: Item) => i.name === itemName)
    : null;
  if (!item)
    return ui?.notifications?.warn(
      `Your controlled Actor does not have an item named ${itemName}`
    );

  // Trigger the item roll
  return item.roll();
}
