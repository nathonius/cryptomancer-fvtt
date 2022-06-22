import { SkillKey } from "../../actor/actor.interface";
import { SettingsService } from "../../settings/settings.service";
import { CheckDifficulty } from "../../skill-check/skill-check.enum";
import { SkillCheckService } from "../../skill-check/skill-check.service";
import { getGame } from "../util";
import { ChatAction } from "./chat.enum";

export function bindChatActions(html: JQuery<HTMLElement>): void {
  html.on("click", ".chat-message button[data-chat-action]", handleChatAction);
}

export function hideActionButtons(message: ChatMessage, html: JQuery<HTMLElement>): void {
  const actionButtons = html.find<HTMLButtonElement>("button[data-chat-action]");
  if (actionButtons.length > 0) {
    const _game = getGame();
    const actorId = message.data.speaker.actor;
    // If no actor attached, leave buttons
    if (!actorId) {
      return;
    }
    const actor = _game.actors!.get(actorId);
    // If the current user owns the actor, is GM, or created the message, leave buttons
    // TODO: message.user -> message.author in Foundry v10
    if ((actor && actor.isOwner) || _game.user!.isGM || (message.user && message.user.id === _game.user!.id)) {
      return;
    }

    // Otherwise conceal action buttons except for saving throw
    actionButtons.each((_, button) => {
      button.style.display = "none";
    });
  }
}

async function handleChatAction(evt: JQuery.ClickEvent): Promise<void> {
  const _game = getGame();
  // Extract card data
  const button: HTMLButtonElement = evt.currentTarget;
  const messageElement: HTMLLIElement = button.closest(".message")!;
  const messageId: string = messageElement.dataset.messageId!;
  const message = _game.messages?.get(messageId)!;
  const action = button.dataset.chatAction as ChatAction;

  switch (action) {
    case ChatAction.LowerDifficulty:
      SkillCheckService.lowerDifficulty(message);
      break;
    case ChatAction.RaiseDifficulty:
      SkillCheckService.raiseDifficulty(message);
      break;
    case ChatAction.SkillCheck:
      const skill = button.dataset.skill as SkillKey;
      handleSkillCheckAction(message, skill);
      break;
  }
}

function handleSkillCheckAction(message: ChatMessage, skill: SkillKey) {
  const _game = getGame();
  const settings = new SettingsService();
  const actorId = message.data.speaker.actor;
  // If no actor attached, abort
  if (!actorId) {
    return;
  }
  const actor = _game.actors!.get(actorId);
  if (!actor || actor.data.type !== "character") {
    return;
  }
  const attribute = actor.data.data.skills[skill].attribute;
  const difficulty = (settings.getSetting("checkDifficulty") as CheckDifficulty) ?? CheckDifficulty.Challenging;
  actor.rollAttribute(attribute, skill, difficulty);
}
