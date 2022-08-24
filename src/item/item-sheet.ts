import type { AugmentedData } from "./item.interface";
import {
  SpellTypes,
  EquipmentTypes,
  EquipmentRules,
  OutfitRules,
  SkillRules,
  WeaponRules,
  MagicRules,
} from "./item.constant";
import { fromCompendium, l } from "../shared/util";

export class CryptomancerItemSheet extends ItemSheet<DocumentSheetOptions, AugmentedData> {
  static override get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cryptomancer", "sheet", "item"],
      width: 580,
      height: 620,
      tabs: [
        {
          navSelector: ".crypt-tabs",
          contentSelector: ".tabs-container",
          initial: "description",
        },
      ],
    });
  }

  override async getData(options?: Partial<DocumentSheetOptions>): Promise<AugmentedData> {
    const context = await super.getData(options);
    context.spellTypes = SpellTypes;
    context.equipmentTypes = EquipmentTypes;
    context.outfitRules = Object.values(OutfitRules).sort((a, b) => {
      return l(a.label) > l(b.label) ? 1 : -1;
    });
    context.weaponRules = Object.values(WeaponRules).sort((a, b) => {
      return l(a.label) > l(b.label) ? 1 : -1;
    });
    context.magicRules = Object.values(MagicRules).sort((a, b) => {
      return l(a.label) > l(b.label) ? 1 : -1;
    });
    context.skillRules = Object.values(SkillRules).sort((a, b) => {
      return l(a.label) > l(b.label) ? 1 : -1;
    });
    return context;
  }

  override get template(): string {
    return `systems/cryptomancer/item/${this.item.data.type}/item-${this.item.data.type}-sheet.hbs`;
  }

  override activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html);
    this.activateEquipmentListeners(html);
  }

  private activateEquipmentListeners(html: JQuery<HTMLElement>): void {
    if (this.object.data.type !== "equipment") {
      return;
    }

    // Handle opening the correct journal entry for equipment rules
    html.find<HTMLDivElement>("section.config .rule-chip[data-compendium][data-journal]").on("click", async (evt) => {
      const compendiumName = evt.currentTarget.dataset.compendium;
      const journalId = evt.currentTarget.dataset.journal;
      if (!compendiumName || !journalId) {
        return;
      }
      const journal = await fromCompendium<JournalEntry>(compendiumName, journalId);
      journal?.sheet?.render(true, { width: 510, height: 300 });
    });

    if (!this.isEditable) {
      return;
    }

    // Handle chip inputs
    html.find<HTMLInputElement>(".quality-input").on("blur", async (evt) => {
      if (!evt.target.value) {
        return;
      }
      await this.handleNewQuality(evt.target);
    });

    html.find<HTMLInputElement>(".quality-input").on("keydown", async (evt) => {
      if (!evt.target.value || evt.key !== "Enter") {
        return;
      }
      await this.handleNewQuality(evt.target);
    });

    // Handle quality deletes
    html.find<HTMLButtonElement>(".crypt-chip.quality .chip-action-button").on("click", async (evt) => {
      if (this.object.data.type !== "equipment") {
        return;
      }
      const chip = $(evt.currentTarget).parents(".crypt-chip");
      const index = chip.data("index");
      const newValues = [...this.object.data.data.qualities];
      newValues.splice(index, 1);
      const updateData: any = {};
      updateData["data.qualities"] = newValues;
      await this.object.update(updateData);
    });

    html.find<HTMLDivElement>("section.status .status-chip").on("click", (evt) => {
      if (this.object.data.type !== "equipment") {
        return;
      }
      const status = evt.currentTarget.dataset.status! as "masterwork" | "trademark" | "equipped";
      const updateData: any = {};
      updateData[`data.${status}`] = !this.object.data.data[status];
      this.object.update(updateData);
    });

    html.find<HTMLDivElement>("section.rules .rule-chip").on("click", (evt) => {
      if (this.object.data.type !== "equipment") {
        return;
      }
      const ruleKey = evt.currentTarget.dataset.rule!;
      const updateData: any = {};
      // Delete rule
      if (this.object.data.data.rules[ruleKey]) {
        updateData[`data.rules.-=${ruleKey}`] = null;
        this.object.update(updateData);
      }
      // Add rule
      else {
        updateData[`data.rules.${ruleKey}`] = { ...EquipmentRules[ruleKey] };
        this.object.update(updateData);
      }
    });
  }

  private async handleNewQuality(target: HTMLInputElement): Promise<void> {
    if (this.object.data.type !== "equipment") {
      return;
    }
    const newValues = target.value
      .split(",")
      .map((val) => val.trim())
      .filter((val) => val !== "");
    if (newValues.length === 0) {
      return;
    }
    const updateData: any = {};
    updateData["data.qualities"] = [...this.object.data.data.qualities, ...newValues];
    await this.object.update(updateData);
  }
}
