import { ActorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs";
import { CoreAlt } from "../../interfaces/cryptomancer";
import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from "../helpers/effects";
import { getGame } from "../util";

type AugmentedData = ActorSheet.Data & {
  actorData: ActorData;
  actorFlags: Record<string, unknown>;
  rollData: object;
  gear: ActorSheetItem[];
  features: ActorSheetItem[];
};

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CryptomancerActorSheet extends ActorSheet<
  ActorSheet.Options,
  AugmentedData
> {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cryptomancer", "sheet", "actor"],
      template: "systems/cryptomancer/templates/actor/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "features",
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/cryptomancer/templates/actor/actor-${this.actor.data.type}-sheet.html`;
  }

  get actorData(): ActorData {
    return this.actor.data;
  }

  get actorFlags(): Record<string, unknown> {
    return this.actorData.flags;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = await super.getData();
    return this.augmentContext(context);
  }

  private augmentContext(context: AugmentedData): AugmentedData {
    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.data.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.actorData = this.actorData;
    context.actorFlags = this.actorFlags;

    // Prepare character data and items.
    if (actorData.type == "character") {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // // Prepare active effects
    // context.effects = prepareActiveEffectCategories(
    //   Array.from(this.actor.effects)
    // );

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context: AugmentedData) {
    // Handle labels.
    for (let [coreKey, coreValue] of Object.entries(
      context.actorData.data.core
    )) {
      coreValue.label = getGame().i18n.localize(`CRYPTOMANCER.Core.${coreKey}`);
      for (let [attrKey, attrValue] of Object.entries(
        (coreValue as CoreAlt).attributes
      )) {
        attrValue.label = getGame().i18n.localize(
          `CRYPTOMANCER.Attr.${attrKey}`
        );
        if (attrValue.skills) {
          for (let [skillKey, skillValue] of Object.entries(attrValue.skills)) {
            skillValue.label = getGame().i18n.localize(
              `CRYPTOMANCER.Skill.${skillKey}`
            );
          }
        }
      }
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context: AugmentedData) {
    // Initialize containers.
    const gear: ActorSheetItem[] = [];
    const features: ActorSheetItem[] = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || CONST.DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === "item") {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === "feature") {
        features.push(i);
      }
    }

    // Assign and return
    context.gear = gear;
    context.features = features;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html: JQuery<HTMLElement>) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find(".item-edit").on("click", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      if (item && item.sheet) {
        item.sheet.render(true);
      }
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find(".item-create").on("click", this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find(".item-delete").on("click", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      if (item) {
        item.delete();
        li.slideUp(200, () => this.render(false));
      }
    });

    // Active Effect management
    html
      .find(".effect-control")
      .on("click", (ev) => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find(".rollable").on("click", this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev: DragEvent) => this._onDragStart(ev);
      html.find("li.item").each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", "true");
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event: JQuery.ClickEvent) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event: JQuery.ClickEvent) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    const rollCore = dataset.rollCore;
    const rollAttribute = dataset.rollAttribute;
    const rollSkill = dataset.rollSkill;

    this.document.rollAttribute(rollCore, rollAttribute, rollSkill);

    // // Handle item rolls.
    // if (dataset.rollType) {
    //   if (dataset.rollType == "item") {
    //     const itemId = element.closest(".item").dataset.itemId;
    //     const item = this.actor.items.get(itemId);
    //     if (item) return item.roll();
    //   }
    // }

    // // Handle rolls that supply the formula directly.
    // if (dataset.roll) {
    //   let label = dataset.label ? `[ability] ${dataset.label}` : "";
    //   let roll = new Roll(dataset.roll, this.actor.getRollData());
    //   roll.toMessage({
    //     speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    //     flavor: label,
    //     rollMode: game.settings.get("core", "rollMode"),
    //   });
    //   return roll;
    // }
  }
}
