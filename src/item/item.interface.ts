import { SkillKey } from "../actor/actor.interface";
import { EquipmentType, SpellType, TrademarkItemType } from "./item.constant";

export interface CryptItemBase {
  description: string;
}

export interface PhysicalItem {
  cost: number;
  quantity: number;
}

export interface Purchaseable {
  purchaseCost: number;
}

export interface Equipment extends CryptItemBase, PhysicalItem {
  type: EquipmentType;
  rules: Record<string, EquipmentRule>;
  qualities: string[];
  trademark: boolean;
  masterwork: boolean;
  equipped: boolean;
}

export interface TrademarkItem extends CryptItemBase {
  type: TrademarkItemType;
  rules: string[];
  qualities: string[];
}

export interface Talent extends CryptItemBase, Purchaseable {
  tiered: boolean;
  tiers: number;
  currentTier: number;
}

export interface Spell extends CryptItemBase, Purchaseable {
  castCost: number;
  type: SpellType;
}

export interface EquipmentRule {
  key: string;
  label: string;
  custom: boolean;
  compendium?: string;
  journal?: string;
  skill?: SkillKey;
  value?: number;
}

export type AugmentedData = ItemSheet.Data & {
  spellTypes: Record<SpellType, string>;
  equipmentTypes: Record<EquipmentType, string>;
  outfitRules: EquipmentRule[];
  weaponRules: EquipmentRule[];
  magicRules: EquipmentRule[];
  skillRules: EquipmentRule[];
};
