import { ActorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs";
import { Character } from "./actor/actor.interface";
import { CryptItem, Spell, Talent } from "./item/item.interface";
import { CryptomancerActor } from "./actor/actor";
import { CryptomancerItem } from "./item/item";

interface CharacterDataSource {
  type: "character";
  data: Character;
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
type CryptomancerActorDataProperties = CryptomancerActorDataSource;
type CryptomancerItemDataSource =
  | ItemDataSource
  | SpellDataSource
  | TalentDataSource;
type CryptomancerItemDataProperties =
  | ItemDataSource
  | SpellDataSource
  | TalentDataSource;

declare global {
  interface SoruceConfig {
    Actor: CryptomancerActorDataSource;
    Item: CryptomancerItemDataSource;
  }
  interface DataConfig {
    Actor: CryptomancerActorDataProperties;
    Item: CryptomancerItemDataProperties;
  }

  interface DocumentClassConfig {
    Actor: typeof CryptomancerActor;
    Item: typeof CryptomancerItem;
  }

  type ActorSheetItem = ActorSheet.Data["items"][0];
}
