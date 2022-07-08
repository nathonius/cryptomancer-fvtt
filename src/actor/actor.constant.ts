import { AttributeKey, Cell, CoreKey, SkillKey } from "./actor.interface";

export const AttributesByCore: Record<CoreKey, [AttributeKey, AttributeKey]> = {
  power: ["strength", "endurance"],
  resolve: ["presence", "willpower"],
  speed: ["agility", "dexterity"],
  wits: ["knowledge", "cunning"],
};

export const SkillsByAttribute: Record<AttributeKey, SkillKey[]> = {
  agility: ["acrobatics", "athletics", "escapeArtistry", "stealth"],
  cunning: ["deception", "scrounge", "tracking", "traps"],
  dexterity: ["firedMissile", "lockPicking", "preciseMelee", "sleightOfHand"],
  endurance: [],
  knowledge: ["alchemy", "craft", "medicine", "query"],
  presence: ["beastKen", "charm", "menace", "performance"],
  strength: ["bruteMelee", "featOfStrength", "thrownMissile", "unarmedMelee"],
  willpower: [],
};

export enum SafehouseRoomType {
  Cryptovault = "cryptovault",
  Dungeon = "dungeon",
  Forge = "forge",
  Front = "front",
  Golem = "golem",
  Laboratory = "laboratory",
  Lounge = "lounge",
  Sanctuary = "sanctuary",
  Stable = "stable",
  TrainingRoom = "trainingRoom",
  WarRoom = "warRoom",
}

export enum CellType {
  Agitators = "agitators",
  Belligerents = "belligerents",
  Cleaner = "cleaner",
  CodeClerics = "codeClerics",
  Recon = "recon",
  ShardStormers = "shardStormers",
  Smugglers = "smugglers",
  Spy = "spy",
}

export enum CellTimeIncrement {
  Downtime = "downtime",
  Day = "day",
  Week = "week",
}

export const DEFAULT_CELL: Cell = {
  mission: "",
  operations: 4,
  skillBreak: false,
  skillPush: false,
  time: {
    increment: CellTimeIncrement.Downtime,
    value: 0,
  },
  type: "",
};

export const CellTypes: Record<CellType, string> = {
  [CellType.Agitators]: "CRYPTOMANCER.CellType.agitators",
  [CellType.Belligerents]: "CRYPTOMANCER.CellType.belligerents",
  [CellType.Cleaner]: "CRYPTOMANCER.CellType.cleaner",
  [CellType.CodeClerics]: "CRYPTOMANCER.CellType.codeClerics",
  [CellType.Recon]: "CRYPTOMANCER.CellType.recon",
  [CellType.ShardStormers]: "CRYPTOMANCER.CellType.shardStormers",
  [CellType.Smugglers]: "CRYPTOMANCER.CellType.smugglers",
  [CellType.Spy]: "CRYPTOMANCER.CellType.spy",
};
