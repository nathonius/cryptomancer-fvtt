import { data } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/module.mjs";
import { Party } from "../../actor/actor.interface";
import { getGame, l } from "../../shared/util";
import { CheckDifficulty } from "../../skill-check/skill-check.enum";
import { CryptomancerActorSheet } from "../actor-sheet";
import { CharacterSheetData } from "../actor-sheet.interface";

export class CharacterSheet extends CryptomancerActorSheet<CharacterSheetData> {
  static override get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/cryptomancer/actor-sheet/character/character-sheet.hbs",
      width: 680,
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
    context.checkDifficulty = this.settings.getSetting("checkDifficulty") ?? CheckDifficulty.Challenging;

    // Prep data for rendering
    context.hpAttributeBar = {
      color: "success",
      max: context.data.data.healthPoints.max,
      maxName: "data.healthPoints.max",
      maxPlaceholder: "Max HP",
      value: context.data.data.healthPoints.value,
      valueName: "data.healthPoints.value",
      valuePlaceholder: "HP",
      class: "hp",
      tooltip: "HP",
    };
    context.manaAttributeBar = {
      color: "primary",
      max: context.data.data.manaPoints.max,
      maxName: "data.manaPoints.max",
      maxPlaceholder: "Max Mana",
      value: context.data.data.manaPoints.value,
      valueName: "data.manaPoints.value",
      valuePlaceholder: "MP",
      class: "mp",
      tooltip: "MP",
    };

    // Prep core and attributes for rendering
    const core = context.data.data.core;
    const attributes = context.data.data.attributes;
    context.core = {
      power: {
        ...core.power,
        attributes: {
          strength: attributes.strength,
          endurance: attributes.endurance,
        },
      },
      resolve: {
        ...core.resolve,
        attributes: {
          presence: attributes.presence,
          willpower: attributes.willpower,
        },
      },
      speed: {
        ...core.speed,
        attributes: {
          agility: attributes.agility,
          dexterity: attributes.dexterity,
        },
      },
      wits: {
        ...core.wits,
        attributes: {
          knowledge: attributes.knowledge,
          cunning: attributes.cunning,
        },
      },
    };

    // Prep skills for rendering
    context.skills = [];
    Object.values(context.data.data.skills).forEach((skill) => {
      if (context.data.type !== "character") {
        return;
      }
      const attribute = context.data.data.attributes[skill.attribute];
      skill.label = l(skill.label);
      context.skills.push({ ...skill, attributeValue: attribute.value });
    });
    context.skills.sort((a, b) => (a.label > b.label ? 1 : -1));

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

    // Rollable abilities.
    html.find(".rollable").on("click", this.onRoll.bind(this));

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find(".item-edit").on("click", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      if (item && item.sheet) {
        item.sheet.render(true);
      }
    });

    // Add talent event listeners
    html.find(".crypt-item-table .action-button").on("click", (evt) => {
      const button = evt.target;
      const row = $(evt.currentTarget).parents(".item-row");
      const item = this.actor.items.get(row.data("itemId"));
      if (!item || !item.sheet) {
        return;
      }
      if (button.classList.contains("view") || button.classList.contains("edit")) {
        item.sheet.render(true);
      } else if (button.classList.contains("delete")) {
        item.deleteDialog();
      }
    });

    html.find(".crypt-item-table .avatar-wrapper").on("click", (evt) => {
      const row = $(evt.currentTarget).parents(".item-row");
      const item = this.actor.items.get(row.data("itemId"));
      if (!item) {
        return;
      }
      item.showChatMessage();
    });

    html.find(".crypt-item-table .name a").on("click", (evt) => {
      const row = $(evt.currentTarget).parents(".item-row");
      const item = this.actor.items.get(row.data("itemId"));
      if (!item || !item.sheet) {
        return;
      }
      item.sheet.render(true);
    });

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

    // Difficulty selector
    html.find(".difficulty-selector input").on("change", this.onDifficultySelect.bind(this));
  }

  private onDifficultySelect(event: JQuery.ChangeEvent) {
    event.preventDefault();
    const difficulty = $(event.currentTarget).parents(".difficulty").data("difficulty");
    switch (difficulty) {
      case "trivial":
        this.settings.updateSetting("checkDifficulty", CheckDifficulty.Trivial);
        break;
      case "challenging":
        this.settings.updateSetting("checkDifficulty", CheckDifficulty.Challenging);
        break;
      case "tough":
        this.settings.updateSetting("checkDifficulty", CheckDifficulty.Tough);
        break;
    }
    this.render();
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  private onRoll(event: JQuery.ClickEvent) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    const rollAttribute = dataset.rollAttribute;
    const rollSkill = dataset.rollSkill;

    this.document.rollAttribute(
      rollAttribute,
      rollSkill,
      (this.settings.getSetting("checkDifficulty") as CheckDifficulty) ?? CheckDifficulty.Challenging
    );
  }
}
