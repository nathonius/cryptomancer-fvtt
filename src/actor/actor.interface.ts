import { CryptomancerItem } from "../item/item";
import { CellTimeIncrement, CellType, SafehouseRoomType } from "./actor.enum";

export type CoreKey = "power" | "resolve" | "speed" | "wits";
export type AttributeKey =
  | "agility"
  | "cunning"
  | "dexterity"
  | "endurance"
  | "knowledge"
  | "presence"
  | "strength"
  | "willpower";
export type SkillKey =
  | "acrobatics"
  | "alchemy"
  | "athletics"
  | "beastKen"
  | "bruteMelee"
  | "charm"
  | "craft"
  | "deception"
  | "escapeArtistry"
  | "featOfStrength"
  | "firedMissile"
  | "lockPicking"
  | "medicine"
  | "menace"
  | "performance"
  | "preciseMelee"
  | "query"
  | "scrounge"
  | "sleightOfHand"
  | "stealth"
  | "thrownMissile"
  | "tracking"
  | "traps"
  | "unarmedMelee";

export interface Character extends ActorCommon {
  attributes: {
    agility: Attribute;
    cunning: Attribute;
    dexterity: Attribute;
    endurance: ResourceAttribute;
    knowledge: Attribute;
    presence: Attribute;
    strength: Attribute;
    willpower: ResourceAttribute;
  };
  skills: Record<SkillKey, Skill>;
  gear: {
    other: string;
    coin: number;
  };
  biography: {
    race: string;
    trueName: string;
    pronouns: string;
    party: string;
    build: string;
    eyes: string;
    hair: string;
    skin: string;
    desires: string;
    fears: string;
    tendsTo: string;
    usedTo: string;
    background: string;
  };
  upgradePoints: {
    label: string;
    key: string;
    value: number;
  };
}

export interface Party {
  risk: {
    min: 1;
    value: number;
    max: 100;
  };
  upgradePoints: 0;
  assets: 0;
  riskEvents: RiskEvent[];
  safehouse: {
    [SafehouseRoomType.Cryptovault]: SafehouseRoom;
    [SafehouseRoomType.Dungeon]: SafehouseRoom;
    [SafehouseRoomType.Forge]: SafehouseRoom;
    [SafehouseRoomType.Front]: SafehouseRoom;
    [SafehouseRoomType.Golem]: SafehouseRoom;
    [SafehouseRoomType.Laboratory]: SafehouseRoom;
    [SafehouseRoomType.Lounge]: SafehouseRoom;
    [SafehouseRoomType.Sanctuary]: SafehouseRoom;
    [SafehouseRoomType.Stable]: SafehouseRoom & { mounts: string };
    [SafehouseRoomType.TrainingRoom]: SafehouseRoom;
    [SafehouseRoomType.WarRoom]: SafehouseRoom;
  };
  cells: Cell[];
}

export interface RiskEvent {
  eventText: string;
  complete: boolean;
}

export interface SafehouseRoom {
  type: SafehouseRoomType;
  owned: boolean;
  value: string;
  cost: number | null;
}

export interface Cell {
  mission: string;
  type: CellType | "";
  skillBreak: boolean;
  skillPush: boolean;
  operations: number | null;
  time: {
    increment: CellTimeIncrement;
    value: number;
  };
}

export interface ActorCommon {
  core: Record<CoreKey, Core>;
  healthPoints: {
    value: number;
    max: number;
    criticalWound: boolean;
    mortalWound: boolean;
  };
  manaPoints: {
    min: number;
    value: number;
    max: number;
  };
  damageReduction: {
    min: number;
    value: number;
  };
}

export interface Core {
  key: CoreKey;
  min: number;
  value: number;
  max: number;
}

export interface Attribute {
  key: AttributeKey;
  core: CoreKey;
  min: number;
  value: number;
  max: number;
}

export interface ResourceAttribute extends Attribute {
  break: boolean;
  push: boolean;
}

export interface Skill {
  key: SkillKey;
  label: string;
  core: CoreKey;
  attribute: AttributeKey;
  break: boolean;
  push: boolean;
}

export interface PreparedCharacter extends Character {
  talents: CryptomancerItem[];
  spells: CryptomancerItem[];
  equipment: CryptomancerItem[];
  weapons: CryptomancerItem[];
  outfits: CryptomancerItem[];
  consumables: CryptomancerItem[];
}
