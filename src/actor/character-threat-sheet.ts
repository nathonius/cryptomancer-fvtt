import { SettingsService } from "../shared/settings/settings.service";
import { CheckDifficulty } from "../shared/skill-check/skill-check.constant";
import { l } from "../shared/util";
import { CryptomancerActorSheet } from "./actor-sheet";
import { CharacterThreatSheetData } from "./actor.interface";

export class CharacterThreatSheet<T extends CharacterThreatSheetData> extends CryptomancerActorSheet<T> {
  override async getData(): Promise<T> {
    const context = await super.getData();
    if (context.data.type !== "character" && context.data.type !== "threat") {
      return context;
    }

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
      if (context.data.type !== "character" && context.data.type !== "threat") {
        return;
      }
      const attribute = context.data.data.attributes[skill.attribute];
      skill.label = l(skill.label);
      context.skills.push({ ...skill, attributeValue: attribute.value });
    });
    context.skills.sort((a, b) => (a.label > b.label ? 1 : -1));

    return context;
  }

  override activateListeners(html: JQuery<HTMLElement>): void {
    if (this.actor.data.type !== "character" && this.actor.data.type !== "threat") {
      return;
    }
    super.activateListeners(html);

    // Rollable abilities.
    html.find(".rollable").on("click", this.onRoll.bind(this));

    // Render the item sheet for viewing/editing
    html.find(".item-edit").on("click", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      if (item && item.sheet) {
        item.sheet.render(true);
      }
    });

    // Add item table event listeners
    html.find<HTMLButtonElement>(".crypt-item-table .action-button").on("click", (evt) => {
      const button = evt.target;
      const row = $(evt.currentTarget).parents(".item-row");
      const item = this.actor.items.get(row.data("itemId"));
      if (!item || !item.sheet) {
        return;
      }

      const action = button.dataset.action;
      switch (action) {
        case "view":
        case "edit":
          item.sheet.render(true);
          break;
        case "delete":
          item.deleteDialog();
          break;
        case "equip":
          if (item.data.type === "equipment") {
            item.update({
              "data.equipped": !item.data.data.equipped,
            });
          }
          break;
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
  }

  /**
   * Handle clickable rolls.
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
      SettingsService.getSetting<CheckDifficulty>("checkDifficulty") ?? CheckDifficulty.Challenging
    );
  }
}
