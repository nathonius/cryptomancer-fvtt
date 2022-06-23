import { AttributeKey, Core, ResourceAttribute } from "../actor/actor.interface";
import { CryptomancerItem } from "../item/item";
import { EquipmentRule } from "../item/item.interface";
import { l } from "./util";
import { SpellType } from "../item/item.constant";

// General Helpers
export function registerHandlebarsHelpers() {
  Handlebars.registerHelper("is", (source: unknown, target: unknown) => {
    return source === target;
  });

  Handlebars.registerHelper("or", (a: any, b: any, options: Handlebars.HelperOptions) => {
    if ([a, b].some((value) => Boolean(value))) {
      return options.fn(true);
    }
  });

  Handlebars.registerHelper("ne", (source: unknown, target: unknown) => {
    return source !== target;
  });

  Handlebars.registerHelper("lt", (a: any, b: any) => {
    return a < b;
  });

  Handlebars.registerHelper("add", (a: number, b: number) => {
    return a + b;
  });

  Handlebars.registerHelper("times", (context: number, options: Handlebars.HelperOptions) => {
    let ret = "";

    for (let i = 0; i < context; i++) {
      ret = ret + options.fn(i);
    }

    return ret;
  });

  Handlebars.registerHelper("notEmpty", (source: unknown[]) => {
    return Boolean(source) && source.length > 0;
  });

  Handlebars.registerHelper("oneOf", (source: unknown, ...target: unknown[]) => {
    return target.includes(source);
  });

  Handlebars.registerHelper("concat", function () {
    let outStr = "";
    for (let arg in arguments) {
      if (typeof arguments[arg] != "object") {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper("safe", (arg: string) => {
    return new Handlebars.SafeString(arg);
  });

  Handlebars.registerHelper("toLowerCase", (input: string) => {
    return input.toLowerCase();
  });

  Handlebars.registerHelper("toUpperCase", (input: string) => {
    return input.toUpperCase();
  });

  Handlebars.registerHelper("l", (key: string) => {
    return l(key);
  });

  Handlebars.registerHelper("firstHalf", (array: any[]) => {
    if (!array || array.length === 0) {
      return [];
    }
    return array.slice(0, Math.floor(array.length / 2));
  });

  Handlebars.registerHelper("lastHalf", (array: any[]) => {
    if (!array || array.length === 0) {
      return [];
    }
    return array.slice(Math.floor(array.length / 2));
  });

  // Sheet Specific Helpers
  Handlebars.registerHelper("localizeSpellType", (type: SpellType) => {
    return l(`SpellType.${type}`);
  });

  Handlebars.registerHelper("chatCardSpellType", (type: SpellType) => {
    return type === SpellType.Cantrip ? l(`SpellType.cantrip`) : l(`SpellType.${type}Spell`);
  });

  Handlebars.registerHelper(
    "noSkillAttribute",
    (core: Core & { attributes: Record<AttributeKey, ResourceAttribute> }, options: Handlebars.HelperOptions) => {
      if (core.key === "resolve") {
        return options.fn(core.attributes["willpower"]);
      } else if (core.key === "power") {
        return options.fn(core.attributes["endurance"]);
      } else {
        return;
      }
    }
  );

  Handlebars.registerHelper("equipmentRuleLabel", (rule: EquipmentRule) => {
    if (rule.value !== undefined) {
      return `${l(rule.label)} ${rule.value}`;
    }
    return l(rule.label);
  });

  Handlebars.registerHelper("hasRule", (rule: EquipmentRule | string, rules: Record<string, EquipmentRule>) => {
    return Object.values(rules)
      .map((r) => r.key)
      .includes(typeof rule === "string" ? rule : rule.key);
  });

  Handlebars.registerHelper("skillRules", (rules: Record<AttributeKey, EquipmentRule>) => {
    return Object.values(rules).filter((r) => Boolean(r.skill));
  });

  /**
   * Lookup and localize the short version of an attribute name
   */
  Handlebars.registerHelper("shortAttr", (attribute: string) => {
    return l(`ShortAttr.${attribute}`);
  });

  /**
   * Return a string showing whether an item is masterwork or trademark
   */
  Handlebars.registerHelper("itemAttrs", (item: CryptomancerItem) => {
    if (item.data.type !== "equipment") {
      return;
    }
    const output: string[] = [];
    if (item.data.data.masterwork) {
      output.push(l("Equipment.masterworkShort"));
    }
    if (item.data.data.trademark) {
      output.push(l("Equipment.trademarkShort"));
    }
    if (output.length > 0) {
      return `(${output.join(", ")})`;
    }
  });
}
