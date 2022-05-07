import { CryptomancerItem } from "../item/item";
import { CheckDifficulty } from "../skill-check/skill-check.enum";
import { CellTimeIncrement, CellType, SafehouseRoomType } from "./actor.enum";

export interface Character {
  core: {
    wits: Core & {
      attributes: {
        knowledge: Attribute & {
          skills: {
            alchemy: Skill;
            craft: Skill;
            medicine: Skill;
            query: Skill;
          };
        };
        cunning: Attribute & {
          skills: {
            deception: Skill;
            scrounge: Skill;
            tracking: Skill;
            traps: Skill;
          };
        };
      };
    };
    resolve: Core & {
      attributes: {
        presence: Attribute & {
          skills: {
            beastKen: Skill;
            charm: Skill;
            menace: Skill;
            performance: Skill;
          };
        };
        willpower: Attribute & {
          skills: undefined;
        };
      };
    };
    speed: Core & {
      attributes: {
        agility: Attribute & {
          skills: {
            acrobatics: Skill;
            athletics: Skill;
            escapeArtistry: Skill;
            stealth: Skill;
          };
        };
        dexterity: Attribute & {
          skills: {
            firedMissile: Skill;
            lockPicking: Skill;
            preciseMissile: Skill;
            sleightOfHand: Skill;
          };
        };
      };
    };
    power: Core & {
      attributes: {
        strength: Attribute & {
          skills: {
            bruteMelee: Skill;
            featOfStrength: Skill;
            thrownMissile: Skill;
            unarmedMelee: Skill;
          };
        };
        endurance: Attribute & {
          skills: undefined;
        };
      };
    };
  };
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
  healthPoints: {
    label: string;
    key: string;
    value: number;
    max: number;
    criticalWound: boolean;
    mortalWound: boolean;
  };
  manaPoints: {
    label: string;
    key: string;
    min: number;
    value: number;
    max: number;
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
  cells: { "1": Cell; "2": Cell; "3": Cell };
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

export interface Core {
  key: string;
  label: string;
  min: number;
  value: number;
  max: number;
}

export interface CoreAlt extends Core {
  attributes: Record<string, AttributeAlt>;
}

export interface Attribute {
  key: string;
  label: string;
  core: string;
  min: number;
  value: number;
  max: number;
}

export interface ResourceAttribute extends Attribute {
  break: boolean;
  push: boolean;
}

export interface AttributeAlt extends Attribute {
  skills: Record<string, Skill>;
}

export interface Skill {
  key: string;
  label: string;
  attribute: string;
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
  checkDifficulty: CheckDifficulty;
}
