import { getGame } from "./util";

const partials: Record<string, string> = {
  coreTriad: "systems/cryptomancer/actor-sheet/components/core-triad.hbs",
  skillList: "systems/cryptomancer/actor-sheet/components/skill-list.hbs",
  resourceSkill:
    "systems/cryptomancer/actor-sheet/components/resource-skill.hbs",
  defense: "systems/cryptomancer/actor-sheet/components/defense.hbs",
  featureList: "systems/cryptomancer/actor-sheet/components/feature-list.hbs",
  bio: "systems/cryptomancer/actor-sheet/components/bio.hbs",
  gear: "systems/cryptomancer/actor-sheet/components/gear.hbs",
  safehouseRoom:
    "systems/cryptomancer/actor-sheet/components/safehouse-room.hbs",
  cell: "systems/cryptomancer/actor-sheet/components/cell.hbs",
  textInput: "systems/cryptomancer/shared/components/text-input/text-input.hbs",
  coreInput: "systems/cryptomancer/shared/components/core-input.hbs",
  toggleBox: "systems/cryptomancer/shared/components/toggle-box.hbs",
};

/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  await cryptLoadTemplates(partials);
  return loadTemplates([
    "systems/cryptomancer/actor-sheet/parts/actor-features.hbs",
    "systems/cryptomancer/actor-sheet/parts/actor-items.hbs",
    "systems/cryptomancer/actor-sheet/parts/actor-spells.hbs",
    "systems/cryptomancer/actor-sheet/parts/actor-effects.hbs",
    "systems/cryptomancer/skill-check/skill-check.hbs",
  ]);
};

/**
 * Get a template from the server by fetch request and caching the retrieved result
 * @param {string} path           The web-accessible HTML template URL
 * @returns {Promise<Function>}	  A Promise which resolves to the compiled Handlebars template
 */
async function cryptGetTemplate(name: string, path: string) {
  if (!_templateCache.hasOwnProperty(name)) {
    await new Promise((resolve, reject) => {
      getGame().socket!.emit("template", path, (resp: any) => {
        if (resp.error) return reject(new Error(resp.error));
        const compiled = Handlebars.compile(resp.html);
        Handlebars.registerPartial(name, compiled);
        _templateCache[name] = compiled;
        console.log(
          `Cryptomancer VTT | Retrieved and compiled template ${name} at ${path}`
        );
        resolve(compiled);
      });
    });
  }
  return _templateCache[path];
}

/* -------------------------------------------- */

/**
 * Load and cache a set of templates by providing an Array of paths
 * @param {string[]} paths    An array of template file paths to load
 * @return {Promise<Function[]>}
 */
async function cryptLoadTemplates(partials: Record<string, string>) {
  const keys = Object.keys(partials);
  return Promise.all(keys.map((k) => cryptGetTemplate(k, partials[k])));
}
