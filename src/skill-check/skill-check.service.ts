import { ParsedRollResult } from "./skill-check.interface.js";
import {
  CheckDifficulty,
  CheckResult,
  DieResult,
  DieType,
} from "./skill-check.enum.js";
import { SkillCheckMessage } from "./skill-check-message.js";

export class SkillCheckService {
  async skillCheck(
    attributeDice: number,
    attributeName = "",
    difficulty = CheckDifficulty.Challenging,
    skillName = "",
    skillBreak = false,
    skillPush = false
  ): Promise<void> {
    const r = new Roll(`{${attributeDice}d10, ${5 - attributeDice}d6}`, {});
    await r.evaluate({ async: true });
    new SkillCheckMessage(
      r,
      attributeName,
      skillName,
      difficulty,
      skillBreak,
      skillPush
    );
  }

  static getCheckResult(
    roll: Roll,
    difficulty: CheckDifficulty,
    skillBreak: boolean,
    skillPush: boolean
  ): { parsedDice: ParsedRollResult[]; result: CheckResult } {
    // Separate dice
    const attributeRoll = (roll.terms[0] as PoolTerm).rolls[0];
    const fateRoll = (roll.terms[0] as PoolTerm).rolls[1];

    // Get dice results
    const parsedDice: ParsedRollResult[] = [
      ...this.parseRoll(attributeRoll, DieType.Attribute, difficulty),
      ...this.parseRoll(fateRoll, DieType.Fate, difficulty),
    ];

    // Get number of hits/botches
    let skillBreakUsed = false;
    let hit = 0;
    let botch = 0;
    parsedDice.forEach((parsed) => {
      if (parsed.result === DieResult.Botch && skillBreak && !skillBreakUsed) {
        parsed.result = DieResult.Hit;
        parsed.break = true;
        skillBreakUsed = true;
      } else if (
        parsed.type === DieType.Attribute &&
        parsed.value === 10 &&
        skillPush
      ) {
        parsed.push = true;
      }
      if (parsed.push) {
        hit += 2;
      } else if (parsed.result === DieResult.Botch) {
        botch += 1;
      } else if (parsed.result === DieResult.Hit) {
        hit += 1;
      }
    });

    const result = this.calculateCheckResult(hit, botch);

    return { parsedDice, result };
  }

  private static parseRoll(
    roll: Roll,
    rollType: DieType,
    difficulty: CheckDifficulty
  ): ParsedRollResult[] {
    const result: ParsedRollResult[] = [];

    (roll.terms[0] as DiceTerm).results.forEach((r) => {
      const parsed: ParsedRollResult = {
        break: false,
        push: false,
        value: r.result,
        result: this.getDieResult(r.result, rollType, difficulty),
        type: rollType,
      };
      result.push(parsed);
    });

    return result;
  }

  private static getDieResult(
    value: number,
    dieType: DieType,
    difficulty: CheckDifficulty
  ): DieResult {
    if (value === 1) {
      return DieResult.Botch;
    } else if (value === 10 || (dieType === DieType.Fate && value === 6)) {
      return DieResult.Hit;
    } else if (dieType === DieType.Attribute && value >= difficulty) {
      return DieResult.Hit;
    } else {
      return DieResult.None;
    }
  }

  private static calculateCheckResult(hit: number, botch: number): CheckResult {
    const value = hit - botch;
    switch (value) {
      case CheckResult.SolidFailure:
        return CheckResult.SolidFailure;
      case CheckResult.AlmostHadIt:
        return CheckResult.AlmostHadIt;
      case CheckResult.JustBarely:
        return CheckResult.JustBarely;
      case CheckResult.SolidSuccess:
        return CheckResult.SolidSuccess;
      default:
        if (value <= CheckResult.DramaticFailure) {
          return CheckResult.DramaticFailure;
        }
        return CheckResult.DramaticSuccess;
    }
  }
}
