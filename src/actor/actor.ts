// Foundry
import { Context } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import {
  ActorData,
  ActorDataConstructorData,
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import { getGame } from "../shared/util";
import { CheckDifficulty } from "../skill-check/skill-check.enum";

import { SkillCheckService } from "../skill-check/skill-check.service";
import { Cell } from "./actor.interface";

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class CryptomancerActor extends Actor {
  constructor(
    data?: ActorDataConstructorData,
    context?: Context<TokenDocument>
  ) {
    super(data, context);
  }

  override prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  override prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  override prepareDerivedData(): void {
    const actorData = this.data;

    this.prepareCharacterData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  private prepareCharacterData(actorData: ActorData) {
    if (actorData.type !== "character") return;
    actorData.data.talents = [];
    actorData.data.spells = [];
    actorData.data.trademarkItems = [];

    actorData.items.forEach((i) => {
      switch (i.type) {
        case "talent":
          actorData.data.talents.push(i);
          break;
        case "spell":
          actorData.data.spells.push(i);
          break;
        case "trademarkItem":
          actorData.data.trademarkItems.push(i);
          break;
      }
    });
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  override getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data: object) {
    // if (this.data.type !== "character") return;
    // // Copy the ability scores to the top level, so that rolls can use
    // // formulas like `@str.mod + 4`.
    // if (data.abilities) {
    //   for (let [k, v] of Object.entries(data.abilities)) {
    //     data[k] = foundry.utils.deepClone(v);
    //   }
    // }
    // // Add level for easier access, or fall back to 0.
    // if (data.attributes.level) {
    //   data.lvl = data.attributes.level.value ?? 0;
    // }
  }

  async rollCellOperations(cell: Cell) {
    if (cell.operations === null) return;
    return SkillCheckService.skillCheck(
      cell.operations,
      "operations",
      CheckDifficulty.Challenging,
      "",
      cell.skillBreak,
      cell.skillPush
    );
  }

  async rollAttribute(
    coreName: string,
    attributeName: string,
    skillName = "",
    difficulty = CheckDifficulty.Challenging
  ) {
    const attribute = (this.data.data as any).core[coreName].attributes[
      attributeName
    ];
    const skill = skillName ? attribute.skills[skillName] : null;
    if (skill) {
      return SkillCheckService.skillCheck(
        attribute.value,
        attributeName,
        difficulty,
        skillName,
        skill.break,
        skill.push
      );
    } else {
      return SkillCheckService.skillCheck(
        attribute.value,
        attributeName,
        difficulty
      );
    }
  }
}
