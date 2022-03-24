import { CheckDifficulty, DieResult, DieType } from "./skill-check.enum";

export interface ParsedRollResult {
  type: DieType;
  value: number;
  result: DieResult;
  break: boolean;
  push: boolean;
}

export interface SkillCheckConfigFlag {
  attribute: string;
  skill: string;
  difficulty: CheckDifficulty;
  skillBreak: boolean;
  skillPush: boolean;
}
