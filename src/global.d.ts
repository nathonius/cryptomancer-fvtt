import { ActorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs";
import { Character, PreparedCharacter } from "./actor/actor.interface";
import { TrademarkItem, Spell, Talent } from "./item/item.interface";
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

interface TrademarkItemDataSource {
  type: "trademarkItem";
  data: TrademarkItem;
}

interface SpellDataSource {
  type: "spell";
  data: Spell;
}

interface TalentDataSource {
  type: "talent";
  data: Talent;
}

type CryptomancerActorDataSource = CharacterDataSource;
type CryptomancerActorDataPrepared = CharacterDataPrepared;
type CryptomancerItemDataSource =
  | TrademarkItemDataSource
  | SpellDataSource
  | TalentDataSource;
type CryptomancerItemDataPrepared =
  | TrademarkItemDataSource
  | SpellDataSource
  | TalentDataSource;

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
