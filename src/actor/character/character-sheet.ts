import { Party } from "../../actor/actor.interface";
import { SettingsService } from "../../shared/settings/settings.service";
import { getGame, l } from "../../shared/util";
import { CheckDifficulty } from "../../shared/skill-check/skill-check.constant";
import { CharacterSheetData } from "../actor.interface";
import { CharacterThreatSheet } from "../character-threat-sheet";

export class CharacterSheet extends CharacterThreatSheet<CharacterSheetData> {
  static override get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/cryptomancer/actor/character/character-sheet.hbs",
      width: 690,
      height: 840,
      tabs: [
        {
          navSelector: ".crypt-tabs",
          contentSelector: ".sheet-body",
          initial: "core",
        },
      ],
    });
  }

  override async getData(): Promise<CharacterSheetData> {
    const context = await super.getData();
    if (context.data.type !== "character") return context;

    // Get configured check difficulty
    context.checkDifficulty =
      SettingsService.getSetting<CheckDifficulty>("checkDifficulty") ?? CheckDifficulty.Challenging;

    // Get all party sheets to select for this character
    context.partyOptions = getGame().actors!.filter((a) => a.type === "party");
    context.selectedParty = null;
    const currentPartyId = context.data.data.biography.party;
    if (currentPartyId) {
      const selectedParty = context.partyOptions.find((p) => p.id === currentPartyId);
      if (selectedParty) {
        context.selectedParty = selectedParty.data.data as Party;
      }
    }

    return context;
  }

  override activateListeners(html: JQuery<HTMLElement>): void {
    if (this.actor.data.type !== "character") return;
    super.activateListeners(html);

    // Add party event listeners
    html.find(".party-upgrade-points .party-action-button").on("click", async (evt) => {
      const button = evt.target as HTMLButtonElement;
      const partyId = button.dataset.partyId;
      if (button.classList.contains("view") && partyId) {
        const party = getGame().actors!.get(partyId);
        if (!party || !party.sheet) {
          return;
        }
        party.sheet.render(true);
      }
    });
  }
}
