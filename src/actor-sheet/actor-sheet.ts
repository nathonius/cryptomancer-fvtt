import type { AttributeAlt, Cell, CoreAlt, Party, RiskEvent } from "../actor/actor.interface";
import { CheckDifficulty } from "../skill-check/skill-check.enum";
import { SettingsService } from "../settings/settings.service";
import { getGame, l } from "../shared/util";
import { AugmentedData } from "./actor-sheet.interface";

// Remove this when migrating to v10
import tippy from "tippy.js";
import { CellTimeIncrement, CellType } from "../actor/actor.enum";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CryptomancerActorSheet extends ActorSheet<DocumentSheetOptions, AugmentedData> {
  private readonly settings = new SettingsService();

  static override get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cryptomancer", "sheet", "actor"],
      template: "systems/cryptomancer/actor-sheet/actor-sheet.hbs",
      width: 680,
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

  override get template() {
    return `systems/cryptomancer/actor-sheet/actor-sheet-${this.actor.data.type}.hbs`;
  }

  /* -------------------------------------------- */

  override async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = await super.getData();
    const augmented = this.augmentContext(context);
    return augmented;
  }

  override activateListeners(html: JQuery<HTMLElement>) {
    super.activateListeners(html);
    tippy("[data-tooltip]", {
      content: (reference) => {
        return (reference as HTMLElement).dataset.tooltip as string;
      },
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    this._activateCharacterListenters(html);
    this._activatePartyListenters(html);

    // Up/down listeners for core inputs
    html.find<HTMLInputElement>(".crypt-core-input > input").on("keydown", (event) => {
      if (!["Up", "ArrowUp", "Down", "ArrowDown"].includes(event.key)) {
        return;
      }
      const currentValue = event.target.value ? parseInt(event.target.value) : 0;
      if (currentValue === NaN) {
        return;
      }
      switch (event.key) {
        case "Up":
        case "ArrowUp":
          event.target.value = `${currentValue + 1}`;
          break;
        case "Down":
        case "ArrowDown":
          event.target.value = `${currentValue - 1}`;
          break;
      }
      this.submit();
    });

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
   * Add data that is specifically for rendering sheets, mainly
   * inputs for partial components.
   */
  private augmentContext(context: AugmentedData): AugmentedData {
    this.prepareCharacterData(context);
    this.preparePartyData(context);
    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  private prepareCharacterData(context: AugmentedData) {
    if (context.data.type !== "character") return;
    // Get configured check difficulty
    context.data.data.checkDifficulty = this.settings.getSetting("checkDifficulty") ?? CheckDifficulty.Challenging;

    // Prep data for rendering
    context.hpAttributeBar = {
      color: "success",
      max: context.data.data.healthPoints.max,
      maxName: "data.healthPoints.max",
      maxPlaceholder: "Max HP",
      value: context.data.data.healthPoints.value,
      valueName: "data.healthPoints.value",
      valuePlaceholder: "HP",
      class: "hp",
      tooltip: "HP",
    };
    context.manaAttributeBar = {
      color: "primary",
      max: context.data.data.manaPoints.max,
      maxName: "data.manaPoints.max",
      maxPlaceholder: "Max Mana",
      value: context.data.data.manaPoints.value,
      valueName: "data.manaPoints.value",
      valuePlaceholder: "MP",
      class: "mp",
      tooltip: "MP",
    };

    // Prep skills for rendering
    context.skills = [];
    Object.values(context.data.data.core).forEach((core) => {
      Object.values(core.attributes).forEach((attr: AttributeAlt) => {
        if (attr.skills) {
          Object.values(attr.skills).forEach((skill) => {
            skill.label = l(skill.label);
            context.skills!.push({
              ...skill,
              core: core.key,
              attributeValue: attr.value,
            });
          });
        }
      });
    });
    context.skills.sort((a, b) => (a.label > b.label ? 1 : -1));

    // Get all party sheets to select for this character
    context.partyOptions = getGame().actors!.filter((a) => a.type === "party");
    context.selectedParty = null;
    const currentPartyId = context.data.data.biography.party;
    if (currentPartyId) {
      const selectedParty = context.partyOptions.find((p) => p.id === currentPartyId);
      if (selectedParty) {
        context.selectedParty = selectedParty.data.data as Party;
      }
    }
  }

  private preparePartyData(context: AugmentedData) {
    if (context.data.type !== "party") {
      return;
    }
    /**
     * Risk Thresholds:
     * 1-10: Green
     * 11-30: Blue
     * 31-49: Orange
     * 50-100: Red
     */
    context.riskColor = "success";
    if (context.data.data.risk.value >= 50) {
      context.riskColor = "danger";
    } else if (context.data.data.risk.value >= 31) {
      context.riskColor = "secondary";
    } else if (context.data.data.risk.value >= 11) {
      context.riskColor = "primary";
    }
  }

  private _activateCharacterListenters(html: JQuery<HTMLElement>): void {
    if (this.actor.data.type !== "character") return;

    // Rollable abilities.
    html.find(".rollable").on("click", this.onRoll.bind(this));

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find(".item-edit").on("click", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      if (item && item.sheet) {
        item.sheet.render(true);
      }
    });

    // Add talent event listeners
    html.find(".crypt-item-table .action-button").on("click", (evt) => {
      const button = evt.target;
      const row = $(evt.currentTarget).parents(".item-row");
      const item = this.actor.items.get(row.data("itemId"));
      if (!item || !item.sheet) {
        return;
      }
      if (button.classList.contains("view") || button.classList.contains("edit")) {
        item.sheet.render(true);
      } else if (button.classList.contains("delete")) {
        item.deleteDialog();
      }
    });

    html.find(".crypt-item-table .avatar-wrapper").on("click", (evt) => {
      const row = $(evt.currentTarget).parents(".item-row");
      const item = this.actor.items.get(row.data("itemId"));
      if (!item) {
        return;
      }
      item.showChatMessage();
    });

    html.find(".crypt-item-table .name a").on("click", (evt) => {
      const row = $(evt.currentTarget).parents(".item-row");
      const item = this.actor.items.get(row.data("itemId"));
      if (!item || !item.sheet) {
        return;
      }
      item.sheet.render(true);
    });

    // Add party event listeners
    html.find(".party-upgrade-points .party-action-button").on("click", async (evt) => {
      const button = evt.target as HTMLButtonElement;
      const partyId = button.dataset.partyId;
      if (button.classList.contains("view") && partyId) {
        const party = getGame().actors!.get(partyId);
        if (!party || !party.sheet) {
          return;
        }
        party.sheet.render(true);
      }
    });

    // Difficulty selector
    html.find(".difficulty-selector input").on("change", this.onDifficultySelect.bind(this));
  }

  private _activatePartyListenters(html: JQuery<HTMLElement>): void {
    if (this.actor.data.type !== "party") return;

    // Handle risk event fields
    html.find<HTMLInputElement>("input.risk-event-field").on("change", (event) => {
      if (this.document.data.type !== "party") {
        return;
      }
      const index = parseInt($(event.currentTarget).parents(".risk-event").data("index"));
      const riskEvent: RiskEvent = { ...this.document.data.data.riskEvents[index] };
      if (event.target.type === "checkbox") {
        riskEvent.complete = event.target.checked;
      } else {
        riskEvent.eventText = event.target.value;
      }
      const newEvents = [...this.document.data.data.riskEvents];
      newEvents.splice(index, 1, riskEvent);
      this.document.update({
        data: {
          riskEvents: newEvents,
        },
      });
    });

    // Handle cell fields
    html.find<HTMLInputElement>("input.cell-field").on("change", (event) => {
      if (this.document.data.type !== "party") {
        return;
      }
      const index = parseInt($(event.currentTarget).parents(".crypt-party-cell").data("index"));
      const field = event.currentTarget.dataset["field"];
      const cell: Cell = { ...this.document.data.data.cells[index] };
      switch (field) {
        case "type":
          // TODO: Make this a select?
          cell.type = event.target.value as CellType;
          break;
        case "operations":
          cell.operations = parseInt(event.target.value);
          break;
        case "skillPush":
          cell.skillPush = event.target.checked;
          break;
        case "skillBreak":
          cell.skillBreak = event.target.checked;
          break;
        case "time.value":
          cell.time.value = parseInt(event.target.value);
          break;
        case "mission":
          cell.mission = event.target.value;
          break;
      }
      const newCells = [...this.document.data.data.cells];
      newCells.splice(index, 1, cell);
      this.document.update({
        data: {
          cells: newCells,
        },
      });
    });

    html.find<HTMLButtonElement>("button.cell-delete").on("click", (event) => {
      const index = parseInt($(event.currentTarget).parents(".crypt-party-cell").data("index"));
      this.document.removeCell(index);
    });

    html.find<HTMLButtonElement>("button.cell-add").on("click", () => {
      this.document.addCell();
    });

    html.find<HTMLButtonElement>("button.risk-event-delete").on("click", (event) => {
      const index = parseInt($(event.currentTarget).parents(".risk-event").data("index"));
      this.document.removeRiskEvent(index);
    });

    html.find<HTMLButtonElement>("button.risk-event-add").on("click", (event) => {
      this.document.addRiskEvent();
    });

    // Operations skill checks
    html.find(".rollable").on("click", this.onCellRoll.bind(this));

    // Cell time increment selector
    html.find(".time-increments__increment").on("click", (event) => {
      if (this.document.data.type !== "party") {
        return;
      }

      event.preventDefault();
      const index = parseInt($(event.currentTarget).parents(".crypt-party-cell").data("index"));
      const increment = event.currentTarget.dataset.increment;
      if (index === undefined) return;
      const cell: Cell = { ...this.document.data.data.cells[index] };
      cell.time.increment = increment as CellTimeIncrement;
      const newCells = [...this.document.data.data.cells];
      newCells.splice(index, 1, cell);
      this.actor.update({
        data: { cells: newCells },
      });
    });
  }

  private onDifficultySelect(event: JQuery.ChangeEvent) {
    event.preventDefault();
    const difficulty = $(event.currentTarget).parents(".difficulty").data("difficulty");
    switch (difficulty) {
      case "trivial":
        this.settings.updateSetting("checkDifficulty", CheckDifficulty.Trivial);
        break;
      case "challenging":
        this.settings.updateSetting("checkDifficulty", CheckDifficulty.Challenging);
        break;
      case "tough":
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
  private onRoll(event: JQuery.ClickEvent) {
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
      (this.settings.getSetting("checkDifficulty") as CheckDifficulty) ?? CheckDifficulty.Challenging
    );
  }

  private onCellRoll(event: JQuery.ClickEvent) {
    if (this.actor.data.type !== "party") return;
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    const index = parseInt(dataset.index);

    this.document.rollCellOperations(this.actor.data.data.cells[index]);
  }
}
