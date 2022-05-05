import { EquipmentType, SpellType } from "../item/item.enum";

export const SpellTypes: Record<SpellType, string> = {
  [SpellType.Cantrip]: "CRYPTOMANCER.SpellType.cantrip",
  [SpellType.Basic]: "CRYPTOMANCER.SpellType.basic",
  [SpellType.Greater]: "CRYPTOMANCER.SpellType.greater",
};

export const EquipmentTypes: Record<EquipmentType, string> = {
  [EquipmentType.Consumable]: "CRYPTOMANCER.EquipmentType.consumable",
  [EquipmentType.Equipment]: "CRYPTOMANCER.EquipmentType.equipment",
  [EquipmentType.Outfit]: "CRYPTOMANCER.EquipmentType.outfit",
  [EquipmentType.Weapon]: "CRYPTOMANCER.EquipmentType.weapon",
};
