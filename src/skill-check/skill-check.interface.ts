import { DieResult, DieType } from "./skill-check.enum";

export interface ParsedRollResult {
  type: DieType;
  value: number;
  result: DieResult;
  break: boolean;
  push: boolean;
}
