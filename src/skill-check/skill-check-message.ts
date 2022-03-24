import { ChatMessageDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData";
import { getGame, l } from "../shared/util.js";
import {
  CheckDifficulty,
  CheckDifficultyLabel,
  CheckResultLabel,
} from "./skill-check.enum.js";
import { SkillCheckService } from "./skill-check.service.js";

export class SkillCheckMessage {
  private message: StoredDocument<ChatMessage> | null = null;

  constructor(
    private readonly roll: Roll,
    private readonly attribute: string,
    private readonly skill: string,
    private difficulty: CheckDifficulty,
    private readonly skillBreak: boolean,
    private readonly skillPush: boolean,
    message: StoredDocument<ChatMessage> | null = null
  ) {
    this.createUpdateMessage(message);
  }

  /**
   * Optionally given an existing chat message, create a
   * new chat message or update the existing one with the
   * new result based on the current difficulty.
   */
  private async createUpdateMessage(
    message: StoredDocument<ChatMessage> | null
  ): Promise<void> {
    // Get result
    const result = SkillCheckService.getCheckResult(
      this.roll,
      this.difficulty,
      this.skillBreak,
      this.skillPush
    );

    // Get labels for chat message
    const labels = {
      attributeName: this.attribute ? l(`Attr.${this.attribute}`) : "",
      skillName: this.skill ? l(`Skill.${this.skill}`) : "",
      difficulty: l(`CheckDifficulty.${CheckDifficultyLabel[this.difficulty]}`),
      checkResult: l(`CheckResult.${CheckResultLabel[result.result]}`),
    };

    // Render template
    const resultTemplate = await renderTemplate(
      "systems/cryptomancer/skill-check/skill-check.hbs",
      { rolls: result.parsedDice, ...labels }
    );

    let newMessage: StoredDocument<ChatMessage>;

    // If there is an existing message, only update it.
    // do not change anything about the speaker or mode, etc.
    if (message) {
      newMessage = (await message.update(
        { content: resultTemplate },
        {}
      )) as StoredDocument<ChatMessage>;
    } else {
      // Get current speaker
      const speaker = ChatMessage.getSpeaker();

      // Combine all message data
      const messageData: ChatMessageDataConstructorData &
        Record<string, unknown> = {
        user: getGame().user?.id,
        speaker,
        content: resultTemplate,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        sound: CONFIG.sounds.dice,
        roll: this.roll,
        whisper: null,
      };

      // Get roll mode
      const rollMode = getGame().settings.get("core", "rollMode");
      if (["gmroll", "blindroll"].includes(rollMode)) {
        messageData.whisper = ChatMessage.getWhisperRecipients("GM");
      }
      newMessage = (await ChatMessage.create(
        messageData,
        {}
      )) as StoredDocument<ChatMessage>;
    }

    // Bind buttons on new message and return
    this.bindMessage(newMessage);
    this.message = newMessage;
  }

  /**
   * Add event listeners to buttons on chat card
   */
  private bindMessage(message: StoredDocument<ChatMessage>): void {
    $(
      `.chat-message[data-message-id='${message.id}'] .difficulty-update-button`
    )
      .off()
      .on("click", (evt) => {
        if (evt.target.classList.contains("left")) {
          this.lowerDifficulty();
        } else {
          this.raiseDifficulty();
        }
      });
  }

  /**
   * Lower the difficulty and re-render
   */
  private lowerDifficulty(): void {
    switch (this.difficulty) {
      case CheckDifficulty.Tough:
        this.difficulty = CheckDifficulty.Challenging;
        break;
      case CheckDifficulty.Challenging:
        this.difficulty = CheckDifficulty.Trivial;
        break;
    }
    this.createUpdateMessage(this.message);
  }

  /**
   * Raise the difficulty and re-render
   */
  private raiseDifficulty(): void {
    switch (this.difficulty) {
      case CheckDifficulty.Trivial:
        this.difficulty = CheckDifficulty.Challenging;
        break;
      case CheckDifficulty.Challenging:
        this.difficulty = CheckDifficulty.Tough;
        break;
    }
    this.createUpdateMessage(this.message);
  }
}
