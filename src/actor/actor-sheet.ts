// Remove this when migrating to v10
import tippy from "tippy.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export abstract class CryptomancerActorSheet<T extends object> extends ActorSheet<DocumentSheetOptions, T> {
  static override get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cryptomancer", "sheet", "actor"],
    });
  }

  override activateListeners(html: JQuery<HTMLElement>) {
    super.activateListeners(html);
    tippy("[data-tooltip]", {
      content: (reference) => {
        return (reference as HTMLElement).dataset.tooltip as string;
      },
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Up/down listeners for core inputs
    html.find<HTMLInputElement>(".crypt-core-input > input[name]").on("keydown", (event) => {
      if (!["Up", "ArrowUp", "Down", "ArrowDown"].includes(event.key)) {
        return;
      }
      const currentValue = event.target.value ? parseInt(event.target.value) : 0;
      if (isNaN(currentValue)) {
        return;
      }
      switch (event.key) {
        case "Up":
        case "ArrowUp":
          event.target.value = `${currentValue + 1}`;
          break;
        case "Down":
        case "ArrowDown":
          event.target.value = `${currentValue - 1}`;
          break;
      }
      this.submit();
    });
  }
}
