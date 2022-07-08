import { ActorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs";
import { Character, Party, PreparedCharacter, PreparedThreat, Threat } from "./actor/actor.interface";
import { TrademarkItem, Spell, Talent, Equipment } from "./item/item.interface";
import { CryptomancerActor } from "./actor/actor";
import { CryptomancerItem } from "./item/item";

interface CharacterDataSource {
  type: "character";
  data: Character;
}

interface CharacterDataPrepared {
  type: "character";
  data: PreparedCharacter;
}

interface PartyDataSource {
  type: "party";
  data: Party;
}

interface PartyDataPrepared {
  type: "party";
  data: Party;
}

interface ThreatDataSource {
  type: "threat";
  data: Threat;
}

interface ThreatDataPrepared {
  type: "threat";
  data: PreparedThreat;
}

interface TrademarkItemDataSource {
  type: "trademarkItem";
  data: TrademarkItem;
}

interface EquipmentDataSource {
  type: "equipment";
  data: Equipment;
}

interface SpellDataSource {
  type: "spell";
  data: Spell;
}

interface TalentDataSource {
  type: "talent";
  data: Talent;
}

type CryptomancerActorDataSource = CharacterDataSource | PartyDataSource | ThreatDataSource;
type CryptomancerActorDataPrepared = CharacterDataPrepared | PartyDataPrepared | ThreatDataPrepared;
type CryptomancerItemDataSource = EquipmentDataSource | TrademarkItemDataSource | SpellDataSource | TalentDataSource;
type CryptomancerItemDataPrepared = EquipmentDataSource | TrademarkItemDataSource | SpellDataSource | TalentDataSource;

declare global {
  interface SoruceConfig {
    Actor: CryptomancerActorDataSource;
    Item: CryptomancerItemDataSource;
  }
  interface DataConfig {
    Actor: CryptomancerActorDataPrepared;
    Item: CryptomancerItemDataPrepared;
  }

  interface DocumentClassConfig {
    Actor: typeof CryptomancerActor;
    Item: typeof CryptomancerItem;
  }

  type ActorSheetItem = ActorSheet.Data["items"][0];
}
