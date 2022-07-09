import { ParsedRollResult, SkillCheckConfigFlag } from "./skill-check.interface";
import {
  CheckDifficulty,
  CheckDifficultyLabel,
  CheckResult,
  CheckResultLabel,
  DieResult,
  DieType,
} from "./skill-check.constant";
import { getGame, l } from "../util";
import type { ChatMessageDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData";
import { CryptomancerActor } from "../../actor/actor";
import { SettingsService } from "../settings/settings.service";
import { SYSTEM } from "../constants";
import { AttributeKey, CoreKey, SkillKey } from "../../actor/actor.interface";

/**
 * Executes skill checks from character sheets, creates
 * chat cards for those skill checks, and updates
 * existing chat cards for previous skill checks.
 */
export class SkillCheckService {
  static async skillCheck(
    attributeDice: number,
    difficulty = CheckDifficulty.Challenging,
    skillBreak = false,
    skillPush = false,
    actor?: CryptomancerActor,
    coreKey?: CoreKey,
    attributeKey?: AttributeKey,
    skillKey?: SkillKey
  ) {
    // Roll dice
    const roll = new Roll(`{${Math.max(attributeDice, 0)}d10, ${Math.max(5 - attributeDice, 0)}d6}`, {});
    await roll.evaluate({ async: true });

    const messageData: ChatMessageDataConstructorData = {
      ...(await this.prepareChatMessage(roll, difficulty, skillBreak, skillPush, coreKey, attributeKey, skillKey)),
      user: getGame().user?.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      roll,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      sound: CONFIG.sounds.dice,
      whisper: null,
    };
    this.applyRollMode(messageData);

    // Create message
    return ChatMessage.create(messageData, {});
  }

  /**
   * Update an existing chat message for a skill check. Args are
   * the message itself and the new values for the message.
   */
  static async updateChatMessage(message: ChatMessage, overrideConfig: Partial<SkillCheckConfigFlag>) {
    // Get config
    const config = message.getFlag(SYSTEM, "check-config") as SkillCheckConfigFlag;
    if (!config || !message.roll) {
      return;
    }

    const combinedConfig = { ...config, ...overrideConfig };

    // Get new data
    const messageData = await this.prepareChatMessage(
      message.roll,
      combinedConfig.difficulty,
      combinedConfig.skillBreak,
      combinedConfig.skillPush,
      combinedConfig.core,
      combinedConfig.attribute,
      combinedConfig.skill
    );

    return message.update(messageData, {});
  }

  static async riskCheck(riskScore: number, party?: CryptomancerActor): Promise<void> {
    const roll = await new Roll("1d100").evaluate({ async: true });
    const failure = roll.total <= riskScore;

    // Render template
    const resultTemplate = await renderTemplate("systems/cryptomancer/shared/skill-check/risk-check.hbs", {
      riskScore,
      failure,
      checkResult: roll.total,
    });

    // Gather message data
    const messageData: ChatMessageDataConstructorData = {
      content: resultTemplate,
      user: getGame().user?.id,
      speaker: ChatMessage.getSpeaker({ actor: party }),
      roll,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      sound: CONFIG.sounds.dice,
      whisper: null,
      flags: {
        cryptomancer: {
          cssClass: `risk-check-${failure ? "failure" : "success"}`,
        },
      },
    };

    // Get roll mode
    const rollMode = getGame().settings.get("core", "rollMode");
    if (["gmroll", "blindroll"].includes(rollMode)) {
      messageData.whisper = ChatMessage.getWhisperRecipients("GM");
    }

    await ChatMessage.create(messageData, {});
  }

  static setCheckDifficulty(difficulty: "trivial" | "challenging" | "tough"): void {
    switch (difficulty) {
      case "trivial":
        SettingsService.updateSetting("checkDifficulty", CheckDifficulty.Trivial);
        break;
      case "challenging":
        SettingsService.updateSetting("checkDifficulty", CheckDifficulty.Challenging);
        break;
      case "tough":
        SettingsService.updateSetting("checkDifficulty", CheckDifficulty.Tough);
        break;
    }
  }

  /**
   * Lower the difficulty and re-render
   */
  static lowerDifficulty(message: ChatMessage): void {
    const config = message.getFlag(SYSTEM, "check-config") as SkillCheckConfigFlag;
    if (!config) {
      return;
    }
    const overrideConfig: Partial<SkillCheckConfigFlag> = {};
    switch (config.difficulty) {
      case CheckDifficulty.Tough:
        overrideConfig.difficulty = CheckDifficulty.Challenging;
        break;
      case CheckDifficulty.Challenging:
        overrideConfig.difficulty = CheckDifficulty.Trivial;
        break;
    }
    this.updateChatMessage(message, overrideConfig);
  }

  /**
   * Raise the difficulty and re-render
   */
  static raiseDifficulty(message: ChatMessage): void {
    const config = message.getFlag(SYSTEM, "check-config") as SkillCheckConfigFlag;
    if (!config) {
      return;
    }
    const overrideConfig: Partial<SkillCheckConfigFlag> = {};
    switch (config.difficulty) {
      case CheckDifficulty.Trivial:
        overrideConfig.difficulty = CheckDifficulty.Challenging;
        break;
      case CheckDifficulty.Challenging:
        overrideConfig.difficulty = CheckDifficulty.Tough;
        break;
    }
    this.updateChatMessage(message, overrideConfig);
  }

  private static async prepareChatMessage(
    roll: Roll,
    difficulty: CheckDifficulty,
    skillBreak: boolean,
    skillPush: boolean,
    coreKey?: string,
    attributeKey?: string,
    skillKey?: string
  ): Promise<Partial<ChatMessageDataConstructorData>> {
    // Evaluate roll
    const { hits, parsedDice, result } = this.getCheckResult(roll, difficulty, skillBreak, skillPush);

    // Get chat message labels
    const labels = {
      coreName: coreKey ? l(`Core.${coreKey}`) : "",
      attributeName: attributeKey ? l(`Attr.${attributeKey}`) : "",
      skillName: skillKey ? l(`Skill.${skillKey}`) : "",
      difficulty: l(`CheckDifficulty.${CheckDifficultyLabel[difficulty]}`),
      checkResult: l(`CheckResult.${CheckResultLabel[result]}`),
      resultDescription: l(`CheckResultDescription.${CheckResultLabel[result]}`),
    };

    // Render template
    const resultTemplate = await renderTemplate("systems/cryptomancer/shared/skill-check/skill-check.hbs", {
      rolls: parsedDice,
      ...labels,
      difficultyValue: difficulty,
      hits: hits,
    });

    const messageData: Partial<ChatMessageDataConstructorData> = {
      content: resultTemplate,
      flags: {
        cryptomancer: {
          "check-config": {
            core: coreKey,
            attribute: attributeKey,
            skill: skillKey,
            difficulty,
            skillBreak,
            skillPush,
          },
        },
      },
    };

    return messageData;
  }

  /**
   * Given a xd10, yd6 roll, the difficulty, and break/push for this skill,
   * returns the values of the dice for rendering as well as the final result
   * of the skill check
   */
  private static getCheckResult(
    roll: Roll,
    difficulty: CheckDifficulty,
    skillBreak: boolean,
    skillPush: boolean
  ): { parsedDice: ParsedRollResult[]; result: CheckResult; hits: number } {
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
      } else if (parsed.type === DieType.Attribute && parsed.value === 10 && skillPush) {
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

    return { parsedDice, result, hits: hit - botch };
  }

  /**
   * Convert a set of rolled dice to a format that can more
   * easily be rendered.
   */
  private static parseRoll(roll: Roll, rollType: DieType, difficulty: CheckDifficulty): ParsedRollResult[] {
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

  /**
   * Gets the result of an individual die based on its value,
   * type, and the difficulty of the check.
   */
  private static getDieResult(value: number, dieType: DieType, difficulty: CheckDifficulty): DieResult {
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

  /**
   * Counts hits and botches and returns the result.
   */
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

  private static applyRollMode(messageData: ChatMessageDataConstructorData): void {
    // Get roll mode
    const rollMode = getGame().settings.get("core", "rollMode");
    if (["gmroll", "blindroll"].includes(rollMode)) {
      messageData.whisper = ChatMessage.getWhisperRecipients("GM");
    }
  }
}
