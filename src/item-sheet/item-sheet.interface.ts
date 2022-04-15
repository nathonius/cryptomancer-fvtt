import type { SpellType, TrademarkItemType } from "../shared/enums/item";

export type AugmentedData = ItemSheet.Data & {
  spellTypes: Record<SpellType, string>;
  itemTypes: Record<TrademarkItemType, string>;
};
