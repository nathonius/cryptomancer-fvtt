import { EquipmentType } from "../../item/item.constant";
import { SYSTEM } from "../../shared/constants";
import { AttributesByCore, THREAT_LINK_FLAG } from "../actor.constant";
import { AttributeKey, CoreKey, SkillKey, ThreatSheetData } from "../actor.interface";
import { CharacterThreatSheet } from "../character-threat-sheet";
import { ThreatSheetFormData } from "./threat-sheet.interface";

export class ThreatSheet extends CharacterThreatSheet<ThreatSheetData> {
  get linkEnabled(): boolean {
    return this.actor.getFlag(SYSTEM, THREAT_LINK_FLAG) as boolean;
  }

  set linkEnabled(value: boolean) {
    this.actor.setFlag(SYSTEM, THREAT_LINK_FLAG, value);
  }

  static override get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/cryptomancer/actor/threat/threat-sheet.hbs",
      width: 690,
      height: 840,
      tabs: [
        {
          navSelector: ".crypt-tabs",
          contentSelector: ".sheet-body",
          initial: "core",
        },
      ],
    });
  }

  protected override _updateObject(event: Event, formData: ThreatSheetFormData): Promise<unknown> {
    if (this.linkEnabled) {
      const targetName = (event.target as HTMLInputElement)?.name;
      if (targetName) {
        const nameParts = targetName.split(".");

        // An attribute is changing, so the linked attribute should change
        if (targetName.startsWith("data.attributes") && targetName.endsWith(".value")) {
          switch (nameParts[2] as AttributeKey) {
            case "agility":
              formData["data.attributes.dexterity.value"] = formData["data.attributes.agility.value"];
              break;
            case "cunning":
              formData["data.attributes.knowledge.value"] = formData["data.attributes.cunning.value"];
              break;
            case "dexterity":
              formData["data.attributes.agility.value"] = formData["data.attributes.dexterity.value"];
              break;
            case "endurance":
              formData["data.attributes.strength.value"] = formData["data.attributes.endurance.value"];
              break;
            case "knowledge":
              formData["data.attributes.cunning.value"] = formData["data.attributes.knowledge.value"];
              break;
            case "presence":
              formData["data.attributes.willpower.value"] = formData["data.attributes.presence.value"];
              break;
            case "strength":
              formData["data.attributes.endurance.value"] = formData["data.attributes.strength.value"];
              break;
            case "willpower":
              formData["data.attributes.presence.value"] = formData["data.attributes.willpower.value"];
              break;
          }
        }

        // Attribute break/push is changing so the linked skills should change
        if (targetName.startsWith("data.skills") && (targetName.endsWith(".break") || targetName.endsWith(".push"))) {
          // Break or push
          const skillName = nameParts[2] as SkillKey;
          const toggleType = nameParts[3] as "break" | "push";
          switch (skillName) {
            case "acrobatics":
            case "athletics":
            case "escapeArtistry":
            case "stealth":
              formData[`data.skills.acrobatics.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              formData[`data.skills.athletics.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              formData[`data.skills.escapeArtistry.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              formData[`data.skills.stealth.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              break;
            case "deception":
            case "scrounge":
            case "tracking":
            case "traps":
              formData[`data.skills.deception.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              formData[`data.skills.scrounge.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              formData[`data.skills.tracking.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              formData[`data.skills.traps.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              break;
            case "firedMissile":
            case "lockPicking":
            case "preciseMelee":
            case "sleightOfHand":
              formData[`data.skills.firedMissile.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              formData[`data.skills.lockPicking.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              formData[`data.skills.preciseMelee.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              formData[`data.skills.sleightOfHand.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              break;
            case "alchemy":
            case "craft":
            case "medicine":
            case "query":
              formData[`data.skills.alchemy.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              formData[`data.skills.craft.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              formData[`data.skills.medicine.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              formData[`data.skills.query.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              break;
            case "beastKen":
            case "charm":
            case "menace":
            case "performance":
              formData[`data.skills.beastKen.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              formData[`data.skills.charm.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              formData[`data.skills.menace.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              formData[`data.skills.performance.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              break;
            case "bruteMelee":
            case "featOfStrength":
            case "thrownMissile":
            case "unarmedMelee":
              formData[`data.skills.bruteMelee.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              formData[`data.skills.featOfStrength.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              formData[`data.skills.thrownMissile.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              formData[`data.skills.unarmedMelee.${toggleType}`] = formData[`data.skills.${skillName}.${toggleType}`];
              break;
          }
        }
      }
    }
    return super._updateObject(event, formData);
  }

  override async getData(): Promise<ThreatSheetData> {
    const context = await super.getData();
    if (context.data.type !== "threat") return context;

    // Store the link status for rendering
    context.linked = this.linkEnabled;

    // Find the equipped outfit
    let equippedOutfits = context.data.data.outfits.filter(
      (i) => i.data.type === "equipment" && i.data.data.type === EquipmentType.Outfit && i.data.data.equipped
    );
    if (equippedOutfits.length > 1) {
      console.warn(
        `Cryptomancer FVTT | ${context.data.name} has multiple outfits equipped, only using the highest DR.`
      );
      equippedOutfits = [
        equippedOutfits.reduce((highest, current) => {
          if (
            current.data.type !== "equipment" ||
            highest.data.type !== "equipment" ||
            current.data.data.rules.damageReduction > highest.data.data.rules.damageReduction
          ) {
            return current;
          }
          return highest;
        }),
      ];
    }
    if (equippedOutfits.length > 0) {
      context.equippedOutfit = equippedOutfits[0];
    }

    return context;
  }

  override activateListeners(html: JQuery<HTMLElement>): void {
    if (this.actor.data.type !== "threat") return;
    super.activateListeners(html);

    html.find<HTMLButtonElement>("button.link-toggle").on("click", () => {
      this.linkToggle();
    });

    // // Attribute value
    // html.find<HTMLInputElement>(".crypt-threat-core .attr-input input").on("change", (evt) => {
    //   const coreKey = $(evt.currentTarget).parents(".crypt-threat-core").data("core") as CoreKey;
    //   const attributeKeys = AttributesByCore[coreKey];
    //   const updateData: any = {};
    //   updateData[`data.attributes.${attributeKeys[0]}.value`] = asNumber(evt.target.value);
    //   updateData[`data.attributes.${attributeKeys[1]}.value`] = asNumber(evt.target.value);
    //   this.object.update(updateData);
    // });

    // // Break / push
    // html.find<HTMLInputElement>(".crypt-threat-core .break-push input").on("change", (evt) => {
    //   const coreKey = $(evt.currentTarget).parents(".crypt-threat-core").data("core") as CoreKey;
    //   const valueType = $(evt.currentTarget).parents(".toggle").data("value") as "break" | "push";
    //   const attributeKeys = AttributesByCore[coreKey];
    //   const skillKeys = [...SkillsByAttribute[attributeKeys[0]], ...SkillsByAttribute[attributeKeys[1]]];
    //   const updateData: any = {};
    //   skillKeys.forEach((key) => {
    //     updateData[`data.skills.${key}.${valueType}`] = evt.target.checked;
    //   });
    //   // Handle endurance
    //   if (coreKey === "power") {
    //     updateData[`data.attributes.endurance.${valueType}`] = evt.target.checked;
    //   } else if (coreKey === "resolve") {
    //     updateData[`data.attributes.willpower.${valueType}`] = evt.target.checked;
    //   }
    //   this.object.update(updateData);
    // });
  }

  /**
   * Returns the combined/lower of the two attribute values
   * for the given core.
   */
  private getAttributeValue(core: CoreKey): number {
    if (this.object.data.type !== "threat") return 0;
    const keys = AttributesByCore[core];
    return Math.min(this.object.data.data.attributes[keys[0]].value, this.object.data.data.attributes[keys[1]].value);
  }

  // /**
  //  * Handle clickable rolls.
  //  */
  // private onRoll(event: JQuery.ClickEvent) {
  //   event.preventDefault();
  //   const element = event.currentTarget as HTMLAnchorElement;
  //   const dataset = element.dataset;

  //   const rollCore = dataset.rollCore as CoreKey;
  //   const rollAttribute = dataset.rollAttribute as AttributeKey;
  //   const difficulty = SettingsService.getSetting<CheckDifficulty>("checkDifficulty") ?? CheckDifficulty.Challenging;

  //   if (element.classList.contains("core")) {
  //     this.document.rollCore(
  //       rollCore,
  //       difficulty,
  //       this.getBreakPush(rollCore, "break"),
  //       this.getBreakPush(rollCore, "push")
  //     );
  //   } else {
  //     this.document.rollAttribute(rollAttribute, undefined, difficulty);
  //   }
  // }

  /**
   * If any attribute or skill of the given core has a true break/push
   * value, return true. Else, false.
   */
  private getBreakPush(core: CoreKey, value: "break" | "push"): boolean {
    if (this.object.data.type !== "threat") return false;
    switch (core) {
      case "power":
        return [
          this.object.data.data.attributes.endurance[value],
          this.object.data.data.skills.bruteMelee[value],
          this.object.data.data.skills.featOfStrength[value],
          this.object.data.data.skills.thrownMissile[value],
          this.object.data.data.skills.unarmedMelee[value],
        ].some((v) => v);
      case "resolve":
        return [
          this.object.data.data.attributes.willpower[value],
          this.object.data.data.skills.beastKen[value],
          this.object.data.data.skills.charm[value],
          this.object.data.data.skills.menace[value],
          this.object.data.data.skills.performance[value],
        ].some((v) => v);
      case "speed":
        return [
          this.object.data.data.skills.acrobatics[value],
          this.object.data.data.skills.athletics[value],
          this.object.data.data.skills.escapeArtistry[value],
          this.object.data.data.skills.stealth[value],
          this.object.data.data.skills.firedMissile[value],
          this.object.data.data.skills.lockPicking[value],
          this.object.data.data.skills.preciseMelee[value],
          this.object.data.data.skills.sleightOfHand[value],
        ].some((v) => v);
      case "wits":
        return [
          this.object.data.data.skills.alchemy[value],
          this.object.data.data.skills.craft[value],
          this.object.data.data.skills.medicine[value],
          this.object.data.data.skills.query[value],
          this.object.data.data.skills.deception[value],
          this.object.data.data.skills.scrounge[value],
          this.object.data.data.skills.tracking[value],
          this.object.data.data.skills.traps[value],
        ].some((v) => v);
    }
  }

  private linkToggle(): void {
    this.linkEnabled = !this.linkEnabled;
  }
}
