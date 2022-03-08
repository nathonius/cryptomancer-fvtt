import { ChatMessageDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData";
import { ParsedRollResult } from "../interfaces/skill-check.interface.js";
import {
  CheckDifficulty,
  CheckResult,
  DieResult,
  DieType,
} from "./enums/skill-check.enum.js";
import { getGame } from "./util.js";

export async function cryptoRoll(
  attributeDice: number,
  attributeName = "",
  difficulty = CheckDifficulty.Challenging,
  skillName = "",
  skillBreak = false,
  skillPush = false
) {
  const r = new Roll(`{${attributeDice}d10, ${5 - attributeDice}d6}`, {});
  await r.evaluate({ async: true });
  showChatRollMessage(
    r,
    attributeName,
    difficulty,
    skillName,
    skillBreak,
    skillPush
  );
}

async function showChatRollMessage(
  roll: Roll,
  attributeName: string,
  difficulty: CheckDifficulty,
  skillName: string,
  skillBreak: boolean,
  skillPush: boolean
) {
  const speaker = ChatMessage.getSpeaker();
  const attributeRoll = (roll.terms[0] as PoolTerm).rolls[0];
  const fateRoll = (roll.terms[0] as PoolTerm).rolls[1];

  const rolls: {
    attribute: ParsedRollResult[];
    fate: ParsedRollResult[];
  } = {
    attribute: [],
    fate: [],
  };

  let skillBreakUsed = false;
  let hit = 0;
  let botch = 0;

  console.log((attributeRoll.terms[0] as DiceTerm).results);
  (attributeRoll.terms[0] as DiceTerm).results.forEach((r) => {
    console.log(r);
    const parsed: ParsedRollResult = {
      break: false,
      push: false,
      value: r.result,
      result: getDieResult(r.result, DieType.Attribute, difficulty),
      type: DieType.Attribute,
    };
    if (parsed.result === DieResult.Botch && skillBreak && !skillBreakUsed) {
      parsed.result = DieResult.Hit;
      parsed.break = true;
      skillBreakUsed = true;
    } else if (parsed.value === 10 && skillPush) {
      parsed.push = true;
    }
    if (parsed.push) {
      hit += 2;
    } else if (parsed.result === DieResult.Botch) {
      botch += 1;
    } else if (parsed.result === DieResult.Hit) {
      hit += 1;
    }
    rolls.attribute.push(parsed);
  });

  // FUTURE NATHAN: THIS IS BUSTED, FOR SOME REASON THIS ARRAY IS EMPTY
  console.log(fateRoll);
  console.log(fateRoll.terms[0]);
  console.log();
  console.log((fateRoll.terms[0] as DiceTerm).results);
  (fateRoll.terms[0] as DiceTerm).results.forEach((r) => {
    console.log(r);
    const parsed: ParsedRollResult = {
      break: false,
      push: false,
      value: r.result,
      result: getDieResult(r.result, DieType.Fate, difficulty),
      type: DieType.Fate,
    };
    if (parsed.result === DieResult.Botch && skillBreak && !skillBreakUsed) {
      parsed.result = DieResult.Hit;
      parsed.break = true;
      skillBreakUsed = true;
    }
    if (parsed.result === DieResult.Botch) {
      botch += 1;
    } else if (parsed.result === DieResult.Hit) {
      hit += 1;
    }
    rolls.fate.push(parsed);
  });

  console.log(rolls);

  const checkResult = getRollResult(hit, botch);
  const resultTemplate = await renderTemplate(
    "systems/cryptomancer/templates/cryptomancer-roll.html",
    { rolls, attributeName, skillName, difficulty, checkResult }
  );

  const messageData: ChatMessageDataConstructorData & Record<string, unknown> =
    {
      user: getGame().user?.id,
      speaker: speaker,
      content: resultTemplate,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      sound: CONFIG.sounds.dice,
      roll,
      whisper: null,
    };

  const rollMode = getGame().settings.get("core", "rollMode");
  if (["gmroll", "blindroll"].includes(rollMode)) {
    messageData.whisper = ChatMessage.getWhisperRecipients("GM");
  }
  // const messageOptions = { rollMode };
  ChatMessage.create(messageData, {});
  // CONFIG.ChatMessage.documentClass.create(messageData, {rollMode})
}

function getDieResult(
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

function getRollResult(hit: number, botch: number): CheckResult {
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
