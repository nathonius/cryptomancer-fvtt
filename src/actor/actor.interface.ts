import { CryptomancerItem } from "../item/item";
import { AttributeBarContext } from "../shared/components/components.interface";
import { CheckDifficulty } from "../shared/skill-check/skill-check.constant";
import { CryptomancerActor } from "./actor";
import { CellTimeIncrement, CellType, SafehouseRoomType } from "./actor.constant";

/* Typed Keys */
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

/* Actor Shared Templates */
export interface ActorTemplateCore {
  core: Record<CoreKey, Core>;
}

export interface ActorTemplateAttributes {
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
}

export interface ActorTemplateSkills {
  skills: Record<SkillKey, Skill>;
}

export interface ActorTemplateHealthPoints {
  healthPoints: {
    value: number;
    max: number;
    criticalWound: boolean;
    mortalWound: boolean;
  };
}

export interface ActorTemplateManaPoints {
  manaPoints: {
    min: number;
    value: number;
    max: number;
  };
}

export interface ActorTemplateDamageReduction {
  damageReduction: {
    min: number;
    value: number;
  };
}

/* Actor Types */
export interface Character
  extends ActorTemplateCore,
    ActorTemplateAttributes,
    ActorTemplateSkills,
    ActorTemplateHealthPoints,
    ActorTemplateManaPoints,
    ActorTemplateDamageReduction {
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

export interface Threat
  extends ActorTemplateCore,
    ActorTemplateAttributes,
    ActorTemplateSkills,
    ActorTemplateHealthPoints,
    ActorTemplateManaPoints,
    ActorTemplateDamageReduction {
  notes: string;
}

/* Actor Member Types */
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

/* Prepared/Sheet Data */
export interface PreparedCharacter extends Character {
  talents: CryptomancerItem[];
  spells: CryptomancerItem[];
  equipment: CryptomancerItem[];
  weapons: CryptomancerItem[];
  outfits: CryptomancerItem[];
  consumables: CryptomancerItem[];
}

export interface PreparedThreat extends Threat {
  talents: CryptomancerItem[];
  spells: CryptomancerItem[];
  equipment: CryptomancerItem[];
  weapons: CryptomancerItem[];
  outfits: CryptomancerItem[];
  consumables: CryptomancerItem[];
}

export type CharacterThreatSheetData = ActorSheet.Data & {
  hpAttributeBar: AttributeBarContext;
  manaAttributeBar: AttributeBarContext;
  core: Record<CoreKey, Core & { attributes: Record<string, Attribute | ResourceAttribute> }>;
  skills: Array<Skill & { attributeValue: number }>;
};

export type CharacterSheetData = CharacterThreatSheetData & {
  checkDifficulty: CheckDifficulty;
  partyOptions: StoredDocument<CryptomancerActor>[];
  selectedParty: Party | null;
  upgradePointsUsed: number;
};

export type PartySheetData = ActorSheet.Data & {
  riskColor: string;
  cellTypes: Record<CellType, string>;
};

export type ThreatSheetData = CharacterThreatSheetData & {
  equippedOutfit: CryptomancerItem | null;
};
