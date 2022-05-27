import { CellType } from "../actor/actor.enum";

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
