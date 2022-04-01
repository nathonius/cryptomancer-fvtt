import { AugmentedData } from "./item-sheet.interface";
import { SpellTypes, TrademarkItemTypes } from "./item-sheet.constant.js";

export class CryptomancerItemSheet extends ItemSheet<
  DocumentSheetOptions,
  AugmentedData
> {
  static override get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cryptomancer", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "description",
        },
      ],
    });
  }

  override async getData(
    options?: Partial<DocumentSheetOptions>
  ): Promise<AugmentedData> {
    const context = await super.getData(options);
    context.spellTypes = SpellTypes;
    context.itemTypes = TrademarkItemTypes;
    return context;
  }

  override get template(): string {
    return `systems/cryptomancer/item-sheet/item-${this.item.data.type}-sheet.hbs`;
  }

  override activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html);

    // TODO: Add edit toggle

    if (this.object.data.type === "talent") {
      // Attach tier change listeners
      if (this.object.data.data.tiered) {
        html
          .find('.tiers .tier-toggle input[type="checkbox"]')
          .on("change", (evt) => {
            if (this.object.data.type === "talent") {
              evt.preventDefault();
              const index = parseInt(evt.target.id.split("-").at(-1)!);
              this.item.update({ data: { currentTier: index + 1 } });
            }
          });
      }
    }
  }
}
