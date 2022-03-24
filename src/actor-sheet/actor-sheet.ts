import { CoreAlt } from "../shared/interfaces/cryptomancer";
import { onManageActiveEffect } from "../shared/effects.js";
import { LocalizationService } from "../shared/localization.service.js";
import { AugmentedData } from "./actor-sheet.interface";
import { CheckDifficulty } from "../skill-check/skill-check.enum.js";
import { SettingsService } from "../settings/settings.service.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CryptomancerActorSheet extends ActorSheet<
  ActorSheet.Options,
  AugmentedData
> {
  private readonly i18n = new LocalizationService();
  private readonly settings = new SettingsService();
  private _data!: AugmentedData;

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cryptomancer", "sheet", "actor"],
      template: "systems/cryptomancer/actor-sheet/actor-sheet.html",
      width: 625,
      height: 700,
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
    return `systems/cryptomancer/actor-sheet/actor-sheet-${this.actor.data.type}.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = await super.getData();
    const augmented = this.augmentContext(context);
    this._data = augmented;
    return augmented;
  }

  /**
   * Add data that is specifically for rendering sheets, mainly
   * inputs for partial components.
   */
  private augmentContext(context: AugmentedData): AugmentedData {
    console.log(context);

    // Prepare character data and items.
    if (context.data.type == "character") {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Get configured check difficulty
    context.checkDifficulty =
      this.settings.getSetting("checkDifficulty") ??
      CheckDifficulty.Challenging;

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
    // Localize resources
    context.data.data.healthPoints.label = this.i18n.l(
      context.data.data.healthPoints.label
    );
    context.data.data.manaPoints.label = this.i18n.l(
      context.data.data.manaPoints.label
    );
    context.data.data.upgradePoints.label = this.i18n.l(
      context.data.data.upgradePoints.label
    );

    // Localize core, attribute, skill
    for (let [coreKey, coreValue] of Object.entries(context.data.data.core)) {
      coreValue.label = this.i18n.l(`Core.${coreKey}`);
      for (let [attrKey, attrValue] of Object.entries(
        (coreValue as CoreAlt).attributes
      )) {
        attrValue.label = this.i18n.l(`Attr.${attrKey}`);
        if (attrValue.skills) {
          for (let [skillKey, skillValue] of Object.entries(attrValue.skills)) {
            skillValue.label = this.i18n.l(`Skill.${skillKey}`);
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

    html
      .find(".difficulty-selector")
      .on("change", this._onDifficultySelect.bind(this));

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

  _onDifficultySelect(event: JQuery.ChangeEvent) {
    event.preventDefault();
    switch (event.target.id as string) {
      case "difficulty-trivial":
        this.settings.updateSetting("checkDifficulty", CheckDifficulty.Trivial);
        break;
      case "difficulty-challenging":
        this.settings.updateSetting(
          "checkDifficulty",
          CheckDifficulty.Challenging
        );
        break;
      case "difficulty-tough":
        this.settings.updateSetting("checkDifficulty", CheckDifficulty.Tough);
        break;
    }
    this.render();
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

    this.document.rollAttribute(
      rollCore,
      rollAttribute,
      rollSkill,
      this._data.checkDifficulty
    );
  }
}
