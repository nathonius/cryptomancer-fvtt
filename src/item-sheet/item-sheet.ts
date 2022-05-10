import type { AugmentedData } from "./item-sheet.interface";
import { SpellTypes, EquipmentTypes } from "./item-sheet.constant";

export class CryptomancerItemSheet extends ItemSheet<DocumentSheetOptions, AugmentedData> {
  static override get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cryptomancer", "sheet", "item"],
      width: 580,
      height: 620,
      tabs: [
        {
          navSelector: ".crypt-tabs",
          contentSelector: ".sheet-body",
          initial: "description",
        },
      ],
    });
  }

  override async getData(options?: Partial<DocumentSheetOptions>): Promise<AugmentedData> {
    const context = await super.getData(options);
    context.spellTypes = SpellTypes;
    context.equipmentTypes = EquipmentTypes;
    return context;
  }

  override get template(): string {
    return `systems/cryptomancer/item-sheet/item-${this.item.data.type}-sheet.hbs`;
  }

  override activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html);
    this.activateEquipmentListeners(html);
  }

  private activateEquipmentListeners(html: JQuery<HTMLElement>): void {
    if (this.object.data.type !== "equipment") {
      return;
    }

    // Handle chip inputs
    html.find<HTMLInputElement>(".chip-input").on("blur", async (evt) => {
      if (!evt.target.value) {
        return;
      }
      await this.handleNewChips(evt.target);
    });

    html.find<HTMLInputElement>(".chip-input").on("keydown", async (evt) => {
      if (!evt.target.value || evt.key !== "Enter") {
        return;
      }
      await this.handleNewChips(evt.target);
    });

    // Handle chip deletes
    html.find<HTMLButtonElement>(".chip-action-button").on("click", async (evt) => {
      if (this.object.data.type !== "equipment") {
        return;
      }
      const chip = $(evt.currentTarget).parents(".crypt-chip");
      const index = chip.data("index");
      const valueType: "rules" | "qualities" = chip.data("valueType");
      const newValues = [...this.object.data.data[valueType]];
      newValues.splice(index, 1);
      const updateData: any = {};
      updateData[`data.${valueType}`] = newValues;
      await this.object.update(updateData);
    });
  }

  private async handleNewChips(target: HTMLInputElement): Promise<void> {
    if (this.object.data.type !== "equipment") {
      return;
    }
    let valueType: "rules" | "qualities" = "rules";
    if (target.classList.contains("qualities")) {
      valueType = "qualities";
    }
    const newValues = target.value
      .split(",")
      .map((val) => val.trim())
      .filter((val) => val !== "");
    if (newValues.length === 0) {
      return;
    }
    const updateData: any = {};
    updateData[`data.${valueType}`] = [...this.object.data.data[valueType], ...newValues];
    await this.object.update(updateData);
  }
}
