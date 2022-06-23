import { ChatMessageDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData";
import { Cell, RiskEvent, SafehouseRoom } from "../../actor/actor.interface";
import { getGame } from "../../shared/util";
import { SkillCheckService } from "../../shared/skill-check/skill-check.service";
import { CryptomancerActorSheet } from "../actor-sheet";
import { CellTypes, CellTimeIncrement, CellType, SafehouseRoomType } from "../actor.constant";
import { PartySheetData } from "../actor.interface";

export class PartySheet extends CryptomancerActorSheet<PartySheetData> {
  static override get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/cryptomancer/actor/party/party-sheet.hbs",
      width: 680,
      height: 840,
      tabs: [
        {
          navSelector: ".crypt-tabs",
          contentSelector: ".sheet-body",
          initial: "party",
        },
      ],
    });
  }

  override async getData(): Promise<PartySheetData> {
    const context = await super.getData();
    if (context.data.type !== "party") {
      return context;
    }
    context.cellTypes = CellTypes;

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
    return context;
  }

  override activateListeners(html: JQuery<HTMLElement>): void {
    if (this.actor.data.type !== "party") return;
    super.activateListeners(html);

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
    html.find<HTMLInputElement>(".cell-field").on("change", (event) => {
      if (this.document.data.type !== "party") {
        return;
      }
      const index = parseInt($(event.currentTarget).parents(".crypt-party-cell").data("index"));
      const field = event.currentTarget.dataset["field"];
      const cell: Cell = { ...this.document.data.data.cells[index] };
      switch (field) {
        case "type":
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

    html.find<HTMLButtonElement>("button.risk-event-add").on("click", () => {
      this.document.addRiskEvent();
    });

    html.find<HTMLButtonElement>("button.risk-check").on("click", this.onRiskCheck.bind(this));

    // Operations skill checks
    html.find(".rollable").on("click", this.onCellRoll.bind(this));

    // Cell time increment selector
    html.find(".time-increment").on("click", (event) => {
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

    // Safehouse chat card
    html.find<HTMLAnchorElement>(".crypt-safehouse-room a.safehouse-name").on("click", (event) => {
      if (this.document.data.type !== "party") {
        return;
      }
      const type = $(event.currentTarget).parents(".crypt-safehouse-room").data("type") as SafehouseRoomType;
      if (type) {
        this.safehouseChatCard(this.document.data.data.safehouse[type]);
      }
    });
  }

  private onCellRoll(event: JQuery.ClickEvent) {
    if (this.actor.data.type !== "party") return;
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    const index = parseInt(dataset.index);

    this.document.rollCellOperations(this.actor.data.data.cells[index]);
  }

  private async onRiskCheck(event: JQuery.ClickEvent) {
    const riskScore = parseInt(event.currentTarget.dataset.risk);
    await SkillCheckService.riskCheck(riskScore, this.object);
  }

  private async safehouseChatCard(safehouse: SafehouseRoom) {
    const _game = getGame();
    const content = await renderTemplate(
      "systems/cryptomancer/actor-sheet/party/components/safehouse-room-chat-card.hbs",
      safehouse
    );
    const messageData: ChatMessageDataConstructorData = {
      user: _game.user?.id,
      speaker: ChatMessage.getSpeaker({ actor: this.object }),
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content,
    };
    ChatMessage.applyRollMode(messageData, _game.settings.get("core", "rollMode"));
    await ChatMessage.create(messageData);
  }
}
