import { CheckDifficulty, CheckDifficultyLabel } from "../skill-check/skill-check.enum";

export type SettingsKeys = "checkDifficulty" | "systemMigrationVersion";

export const Settings: Record<SettingsKeys, ClientSettings.PartialSetting> = {
  checkDifficulty: {
    type: Number,
    scope: "client",
    default: CheckDifficulty.Challenging,
    config: false,
    choices: {
      [CheckDifficulty.Trivial]: CheckDifficultyLabel[CheckDifficulty.Trivial],
      [CheckDifficulty.Challenging]: CheckDifficultyLabel[CheckDifficulty.Challenging],
      [CheckDifficulty.Tough]: CheckDifficultyLabel[CheckDifficulty.Tough],
    },
  },
  systemMigrationVersion: {
    type: String,
    scope: "world",
    default: "0.3.0",
    config: false,
  },
};
