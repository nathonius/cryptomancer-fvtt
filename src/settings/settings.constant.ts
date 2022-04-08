import {
  CheckDifficulty,
  CheckDifficultyLabel,
} from "../skill-check/skill-check.enum";

export type SettingsKeys = "checkDifficulty";

export const Module = "Cryptomancer";

export const Settings: Record<
  SettingsKeys,
  ClientSettings.PartialSetting<number>
> = {
  checkDifficulty: {
    type: Number,
    scope: "client",
    default: CheckDifficulty.Challenging,
    config: false,
    choices: {
      [CheckDifficulty.Trivial]: CheckDifficultyLabel[CheckDifficulty.Trivial],
      [CheckDifficulty.Challenging]:
        CheckDifficultyLabel[CheckDifficulty.Challenging],
      [CheckDifficulty.Tough]: CheckDifficultyLabel[CheckDifficulty.Tough],
    },
  },
};
