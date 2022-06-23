import { bindChatActions } from "../chat/chat";
import { CheckDifficulty } from "../skill-check/skill-check.constant";
import { SettingsService } from "../settings/settings.service";
import { SkillCheckService } from "../skill-check/skill-check.service";
import tippy from "tippy.js";

export async function renderChatLog(_chatLog: ChatLog, html: JQuery<HTMLElement>): Promise<void> {
  bindChatActions(html);

  // Render difficulty selector
  const difficultySelectorContent = await renderTemplate(
    "systems/cryptomancer/shared/skill-check/difficulty-selector.hbs",
    {
      checkDifficulty: SettingsService.getSetting<CheckDifficulty>("checkDifficulty") ?? CheckDifficulty.Challenging,
    }
  );

  // Append check selector
  html.find("#chat-controls").before(difficultySelectorContent);

  // Setup tooltips. Remove this in v10.
  tippy("[data-tooltip]", {
    content: (reference) => {
      return (reference as HTMLElement).dataset.tooltip as string;
    },
  });

  // Add event listeners
  const toggles = html.find<HTMLInputElement>(".crypt-difficulty-selector .toggles input");
  toggles.on("change", (event) => {
    event.preventDefault();
    const difficulty: "trivial" | "challenging" | "tough" = $(event.currentTarget)
      .parents(".difficulty")
      .data("difficulty");
    toggles.each((_index, el) => {
      if (el !== event.currentTarget) {
        el.checked = false;
      }
    });
    SkillCheckService.setCheckDifficulty(difficulty);
  });

  // Scroll chatlog down
  const chatLog = html.find("#chat-log");
  chatLog.scrollTop(chatLog[0].scrollHeight || 0);
}
