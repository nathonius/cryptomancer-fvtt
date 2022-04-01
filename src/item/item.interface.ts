import { SpellType, TrademarkItemType } from "../shared/enums/item.js";

export interface CryptItemBase {
  description: string;
}

export interface Purchaseable extends CryptItemBase {
  purchaseCost: number;
}

export interface TrademarkItem extends CryptItemBase {
  type: TrademarkItemType;
  rules: string;
  qualities: string;
}

export interface Talent extends Purchaseable {
  tiered: boolean;
  tiers: number;
  currentTier: number;
}

export interface Spell extends Purchaseable {
  castCost: number;
  type: SpellType;
}
