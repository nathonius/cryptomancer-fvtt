/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    "systems/cryptomancer/actor-sheet/components/core-triad.html",
    "systems/cryptomancer/actor-sheet/components/skill-list.html",
    "systems/cryptomancer/actor-sheet/components/resource-skill.html",
    "systems/cryptomancer/actor-sheet/components/defense.html",
    "systems/cryptomancer/actor-sheet/parts/actor-features.html",
    "systems/cryptomancer/actor-sheet/parts/actor-items.html",
    "systems/cryptomancer/actor-sheet/parts/actor-spells.html",
    "systems/cryptomancer/actor-sheet/parts/actor-effects.html",
    "systems/cryptomancer/skill-check/skill-check.html",
    "systems/cryptomancer/shared/components/text-input/text-input.html",
    "systems/cryptomancer/shared/components/core-input/core-input.html",
    "systems/cryptomancer/shared/components/toggle-box/toggle-box.html",
  ]);
};
