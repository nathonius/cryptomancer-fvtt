import { SpellType, EquipmentType } from "../item/item.enum";

export type AugmentedData = ItemSheet.Data & {
  spellTypes: Record<SpellType, string>;
  equipmentTypes: Record<EquipmentType, string>;
};
