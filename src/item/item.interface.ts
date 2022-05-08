import { EquipmentType, SpellType, TrademarkItemType } from "./item.enum";

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
  rules: string[];
  qualities: string[];
  trademark: boolean;
  masterwork: boolean;
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
