import { SpellType, TrademarkItemType } from "../shared/enums/item";

export const SpellTypes: Record<SpellType, string> = {
  [SpellType.Cantrip]: "CRYPTOMANCER.SpellType.cantrip",
  [SpellType.Basic]: "CRYPTOMANCER.SpellType.basic",
  [SpellType.Greater]: "CRYPTOMANCER.SpellType.greater",
};

export const TrademarkItemTypes: Record<TrademarkItemType, string> = {
  [TrademarkItemType.Outfit]: "CRYPTOMANCER.TrademarkItemType.outfit",
  [TrademarkItemType.Weapon]: "CRYPTOMANCER.TrademarkItemType.weapon",
};
