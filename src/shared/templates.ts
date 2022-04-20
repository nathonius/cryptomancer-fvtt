import { Button, CoreInput, CoreTriad, FormField, ToggleBox } from "crypt-ui";
// import CoreTriad from "../actor-sheet/components/CoreTriad.svelte";
import CoreTriadAttribute from "../actor-sheet/components/CoreTriadAttribute.svelte";

/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  registerElements();
  return loadTemplates([
    "systems/cryptomancer/actor-sheet/components/core-triad.hbs",
    "systems/cryptomancer/actor-sheet/components/skill-list.hbs",
    "systems/cryptomancer/actor-sheet/components/resource-skill.hbs",
    "systems/cryptomancer/actor-sheet/components/defense.hbs",
    "systems/cryptomancer/actor-sheet/components/feature-list.hbs",
    "systems/cryptomancer/actor-sheet/components/bio.hbs",
    "systems/cryptomancer/actor-sheet/components/gear.hbs",
    "systems/cryptomancer/actor-sheet/components/safehouse-room.hbs",
    "systems/cryptomancer/actor-sheet/components/cell.hbs",
    "systems/cryptomancer/actor-sheet/parts/actor-features.hbs",
    "systems/cryptomancer/actor-sheet/parts/actor-items.hbs",
    "systems/cryptomancer/actor-sheet/parts/actor-spells.hbs",
    "systems/cryptomancer/actor-sheet/parts/actor-effects.hbs",
    "systems/cryptomancer/skill-check/skill-check.hbs",
    "systems/cryptomancer/shared/components/text-input/text-input.hbs",
    "systems/cryptomancer/shared/components/core-input/core-input.hbs",
    "systems/cryptomancer/shared/components/toggle-box/toggle-box.hbs",
  ]);
};

function registerElements(): void {
  const elements: Array<{ tag: string; el: any }> = [
    { el: Button, tag: "crypt-button" },
    { el: CoreInput, tag: "crypt-input" },
    { el: FormField, tag: "crypt-form-field" },
    { el: ToggleBox, tag: "crypt-toggle-box" },
    { el: CoreTriad, tag: "crypt-core-triad" },
    { el: CoreTriadAttribute, tag: "crypt-core-triad-attribute" },
  ];
  elements.forEach((def) => {
    registerElement(def.tag, def.el);
  });
}

function registerElement(tag: string, el: any): void {
  if (customElements.get(tag)) {
    return;
  }
  customElements.define(tag, el);
}
