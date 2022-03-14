import { ActorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs";
import { Character } from "./shared/interfaces/cryptomancer";
import { CryptomancerActor } from "./actor/actor.component";

interface CharacterDataSource {
  type: "character";
  data: Character;
}

type CryptomancerDataSource = CharacterDataSource;
type CryptomancerDataProperties = CharacterDataSource;
type CryptomancerDocumentClassConfig = CryptomancerActor;

declare global {
  interface SoruceConfig {
    Actor: CryptomancerDataSource;
  }
  interface DataConfig {
    Actor: CryptomancerDataProperties;
  }

  interface DocumentClassConfig {
    Actor: typeof CryptomancerActor;
  }

  type ActorSheetItem = ActorSheet.Data["items"][0];
}
