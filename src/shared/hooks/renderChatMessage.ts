import { hideActionButtons } from "../chat/chat";
import { SYSTEM } from "../constants";

export function renderChatMessage(message: ChatMessage, html: JQuery<HTMLElement>): void {
  hideActionButtons(message, html);

  // Apply a css class to the message if it is configured in a flag
  const cssClass = message.getFlag(SYSTEM, "cssClass") as string | null;
  if (cssClass) {
    html.addClass(cssClass);
  }
}
