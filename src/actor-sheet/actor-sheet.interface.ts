import { CryptomancerActor } from "../actor/actor";
import { Party, Skill } from "../actor/actor.interface";
import { AttributeBarContext } from "../shared/components/components.interface";
import { CheckDifficulty } from "../skill-check/skill-check.enum";

export type AugmentedData = ActorSheet.Data & {
  checkDifficulty: CheckDifficulty;
  hpAttributeBar: AttributeBarContext;
  manaAttributeBar: AttributeBarContext;
  skills: Array<Skill & { core: string; attributeValue: number }>;
  partyOptions: StoredDocument<CryptomancerActor>[];
  selectedParty: Party | null;
  upgradePointsUsed: number;
};
