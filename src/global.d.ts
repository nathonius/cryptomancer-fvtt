import { Character } from "./interfaces/cryptomancer";

interface CharacterDataSource {
  type: "character";
  data: Character;
}

type CryptomancerDataSource = CharacterDataSource;
type CryptomancerDataProperties = CharacterDataSource;

declare global {
  interface SoruceConfig {
    Actor: CryptomancerDataSource;
  }
  interface DataConfig {
    Actor: CryptomancerDataProperties;
  }
}
