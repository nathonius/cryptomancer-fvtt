import { ChatMessageDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData";
import { CryptomancerActor } from "../actor/actor";
import { getGame } from "../shared/util";
import { EquipmentType } from "./item.enum";

export class CryptomancerItem extends Item {
  public async showChatMessage(): Promise<void> {
    const _game = getGame();
    const _actor: CryptomancerActor | undefined = this.actor || undefined;
    const _token = _actor?.token || undefined;

    const templateData: Record<string, any> = {
      title: this.name,
      avatar: this.img,
      description: this.data.data.description,
    };

    if (this.data.type === "equipment" && [EquipmentType.Outfit, EquipmentType.Weapon].includes(this.data.data.type)) {
      templateData["rules"] = this.data.data.rules;
    }

    if (this.data.type === "spell") {
      templateData["castCost"] = this.data.data.castCost;
      templateData["type"] = this.data.data.type;
    }

    const content = await renderTemplate("systems/cryptomancer/item/chat-card.hbs", templateData);
    const messageData: ChatMessageDataConstructorData = {
      user: _game.user?.id,
      speaker: ChatMessage.getSpeaker({ actor: _actor, token: _token }),
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content,
    };

    ChatMessage.applyRollMode(messageData, _game.settings.get("core", "rollMode"));
    await ChatMessage.create(messageData);
  }
}
