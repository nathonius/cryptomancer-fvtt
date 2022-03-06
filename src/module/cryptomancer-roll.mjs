export async function cryptoRoll(
  attributeDice,
  attributeName = "",
  difficulty = "challenging",
  skillName = "",
  skillBreak = false,
  skillPush = false
) {
  const r = new Roll(`{${attributeDice}d10, ${5 - attributeDice}d6}`, {});
  r.evaluate({ async: true });
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
  roll,
  attributeName,
  difficulty,
  skillName,
  skillBreak,
  skillPush
) {
  const speaker = ChatMessage.getSpeaker();
  console.log(speaker);
  console.log(roll);
  const attributeRoll = roll.terms[0].rolls[0];
  const fateRoll = roll.terms[0].rolls[1];

  const attributeResults = attributeRoll.terms[0].results;
  const fateResults = fateRoll.terms[0].results;

  let hit = 0;
  let botch = 0;
  let threshold = 6;
  if (difficulty === "trivial") {
    threshold = 4;
  } else if (difficulty === "tough") {
    threshold = 8;
  }

  attributeResults.forEach((result) => {
    if (result.result === 1) {
      botch += 1;
    } else if (skillPush && result.result === 10) {
      console.log("SKILL PUSH");
      hit += 2;
    } else if (result.result >= threshold) {
      hit += 1;
    }
  });

  fateResults.forEach((result) => {
    if (result.result === 1) {
      botch += 1;
    } else if (result.result === 6) {
      hit += 1;
    }
  });

  if (skillBreak && botch > 0) {
    console.log("SKILL BREAK");
    botch -= 1;
  }
  console.log(`HIT: ${hit}; BOTCH: ${botch}; TOTAL: ${hit - botch}`);
}
