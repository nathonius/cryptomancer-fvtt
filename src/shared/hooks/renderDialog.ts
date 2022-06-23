/**
 * Don't allow the creation of trademark items.
 * @DEPRECATED Remove this in 1.0.0
 */
export function renderDialog(_dialog: Dialog, html: JQuery<HTMLElement>): void {
  Array.from(html.find<HTMLOptionElement>("#document-create option")).forEach((option) => {
    if (option.value === "trademarkItem") {
      option.remove();
    }
  });
}
