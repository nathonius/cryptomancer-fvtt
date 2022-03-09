/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    "systems/cryptomancer/actor-sheet/parts/actor-features.html",
    "systems/cryptomancer/actor-sheet/parts/actor-items.html",
    "systems/cryptomancer/actor-sheet/parts/actor-spells.html",
    "systems/cryptomancer/actor-sheet/parts/actor-effects.html",
    "systems/cryptomancer/actor-sheet/parts/actor-attribute.html",
    "systems/cryptomancer/skill-check/skill-check.component.html",
  ]);
};
