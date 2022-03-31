import { SpellType } from "../shared/enums/item.js";

export const SpellTypes: Record<SpellType, string> = {
  [SpellType.Cantrip]: "CRYPTOMANCER.SpellType.cantrip",
  [SpellType.Basic]: "CRYPTOMANCER.SpellType.basic",
  [SpellType.Greater]: "CRYPTOMANCER.SpellType.greater",
};
