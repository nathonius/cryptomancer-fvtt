import { ActorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs";
import { Character, PreparedCharacter } from "./actor/actor.interface";
import { CryptItem, Spell, Talent } from "./item/item.interface";
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

interface ItemDataSource {
  type: "item";
  data: CryptItem;
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
  | ItemDataSource
  | SpellDataSource
  | TalentDataSource;
type CryptomancerItemDataPrepared =
  | ItemDataSource
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
