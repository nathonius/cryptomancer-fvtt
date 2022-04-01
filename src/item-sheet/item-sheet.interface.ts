import { SpellType, TrademarkItemType } from "../shared/enums/item.js";

export type AugmentedData = ItemSheet.Data & {
  spellTypes: Record<SpellType, string>;
  itemTypes: Record<TrademarkItemType, string>;
};
