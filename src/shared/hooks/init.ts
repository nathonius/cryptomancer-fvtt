import { CharacterSheet } from "../../actor/character/character-sheet";
import { CryptomancerActor } from "../../actor/actor";
import { CryptomancerItem } from "../../item/item";
import { CryptomancerItemSheet } from "../../item/item-sheet";
import { PartySheet } from "../../actor/party/party-sheet";
import { preloadHandlebarsTemplates } from "../templates";
import { SettingsService } from "../settings/settings.service";
import { SYSTEM } from "../constants";

export async function init(): Promise<void> {
  // Define custom Document classes
  CONFIG.Actor.documentClass = CryptomancerActor;
  CONFIG.Item.documentClass = CryptomancerItem;

  // Register settings
  SettingsService.registerSettings();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet(SYSTEM, CharacterSheet, {
    makeDefault: true,
    label: "CRYPTOMANCER.SheetType.character",
    types: ["character"],
  });
  Actors.registerSheet(SYSTEM, PartySheet, {
    makeDefault: true,
    label: "CRYPTOMANCER.SheetType.party",
    types: ["party"],
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet(SYSTEM, CryptomancerItemSheet, {
    makeDefault: true,
    label: "CRYPTOMANCER.SheetType.talent",
    types: ["talent"],
  });
  Items.registerSheet(SYSTEM, CryptomancerItemSheet, {
    makeDefault: true,
    label: "CRYPTOMANCER.SheetType.spell",
    types: ["spell"],
  });
  Items.registerSheet(SYSTEM, CryptomancerItemSheet, {
    makeDefault: true,
    label: "CRYPTOMANCER.SheetType.equipment",
    types: ["equipment"],
  });

  // Preload Handlebars templates.
  await preloadHandlebarsTemplates();
}
