// Foundry
import {
  Context,
  DocumentModificationOptions,
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import {
  ActorData,
  ActorDataBaseProperties,
  ActorDataConstructorData,
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import { PropertiesToSource } from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";
import { CryptomancerItem } from "../item/item";
import { EquipmentType } from "../item/item.enum";
import { CheckDifficulty } from "../skill-check/skill-check.enum";
import { fromCompendium } from "../shared/util";

import { SkillCheckService } from "../skill-check/skill-check.service";
import { DEFAULT_CELL } from "./actor.constant";
import { AttributeKey, Cell, ResourceAttribute, RiskEvent, SkillKey } from "./actor.interface";

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class CryptomancerActor extends Actor {
  constructor(data?: ActorDataConstructorData, context?: Context<TokenDocument>) {
    super(data, context);
  }

  override _onCreate(
    data: PropertiesToSource<ActorDataBaseProperties>,
    options: DocumentModificationOptions,
    userId: string
  ) {
    super._onCreate(data, options, userId);
    this.addUnarmedStrike();
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
    actorData.data.consumables = [];
    actorData.data.equipment = [];
    actorData.data.outfits = [];
    actorData.data.weapons = [];

    actorData.items.forEach((i: CryptomancerItem) => {
      switch (i.data.type) {
        case "talent":
          actorData.data.talents.push(i);
          break;
        case "spell":
          actorData.data.spells.push(i);
          break;
        case "equipment":
          switch (i.data.data.type) {
            case EquipmentType.Consumable:
              actorData.data.consumables.push(i);
              break;
            case EquipmentType.Equipment:
              actorData.data.equipment.push(i);
              break;
            case EquipmentType.Outfit:
              actorData.data.outfits.push(i);
              break;
            case EquipmentType.Weapon:
              actorData.data.weapons.push(i);
              break;
          }
          break;
      }
    });
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  override getRollData() {
    return super.getRollData();
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
    attributeName: AttributeKey,
    skillName: SkillKey | "" = "",
    difficulty = CheckDifficulty.Challenging
  ) {
    if (this.data.type !== "character") {
      return;
    }
    const attribute = this.data.data.attributes[attributeName];
    const skill = skillName ? this.data.data.skills[skillName] : null;
    if (skill) {
      return SkillCheckService.skillCheck(
        attribute.value,
        attributeName,
        difficulty,
        skillName,
        skill.break,
        skill.push,
        this
      );
    } else {
      return SkillCheckService.skillCheck(
        attribute.value,
        attributeName,
        difficulty,
        undefined,
        Boolean((attribute as ResourceAttribute).break),
        Boolean((attribute as ResourceAttribute).push),
        this
      );
    }
  }

  async addCell(cell?: Cell): Promise<void> {
    if (this.data.type !== "party") {
      return;
    }

    if (!cell) {
      cell = { ...DEFAULT_CELL };
    }
    const newCells = [...this.data.data.cells, cell];
    await this.update({ data: { cells: newCells } });
  }

  async removeCell(index: number): Promise<void> {
    if (this.data.type !== "party") {
      return;
    }

    const newCells = [...this.data.data.cells];
    newCells.splice(index, 1);
    await this.update({ data: { cells: newCells } });
  }

  async addRiskEvent(eventText: string = ""): Promise<void> {
    if (this.data.type !== "party") {
      return;
    }
    const newRiskEvents: RiskEvent[] = [...this.data.data.riskEvents, { complete: false, eventText }];
    await this.update({ data: { riskEvents: newRiskEvents } });
  }

  async removeRiskEvent(index: number): Promise<void> {
    if (this.data.type !== "party") {
      return;
    }
    const newRiskEvents = [...this.data.data.riskEvents];
    newRiskEvents.splice(index, 1);
    await this.update({ data: { riskEvents: newRiskEvents } });
  }

  private async addUnarmedStrike(): Promise<void> {
    const storedUnarmedStrike = await fromCompendium<CryptomancerItem>("weapons", "nATp07dapVa5QDbu");
    if (!storedUnarmedStrike) {
      return;
    }
    await this.createEmbeddedDocuments("Item", [storedUnarmedStrike.data.toObject()]);
  }
}
