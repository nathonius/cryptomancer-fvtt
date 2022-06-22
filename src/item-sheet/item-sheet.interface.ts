import { SpellType, EquipmentType } from "../item/item.enum";
import { EquipmentRule } from "../item/item.interface";

export type AugmentedData = ItemSheet.Data & {
  spellTypes: Record<SpellType, string>;
  equipmentTypes: Record<EquipmentType, string>;
  outfitRules: EquipmentRule[];
  weaponRules: EquipmentRule[];
  skillRules: EquipmentRule[];
};
