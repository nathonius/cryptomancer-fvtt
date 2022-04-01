/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    "systems/cryptomancer/actor-sheet/components/core-triad.hbs",
    "systems/cryptomancer/actor-sheet/components/skill-list.hbs",
    "systems/cryptomancer/actor-sheet/components/resource-skill.hbs",
    "systems/cryptomancer/actor-sheet/components/defense.hbs",
    "systems/cryptomancer/actor-sheet/components/feature-list.hbs",
    "systems/cryptomancer/actor-sheet/components/bio.hbs",
    "systems/cryptomancer/actor-sheet/components/gear.hbs",
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
