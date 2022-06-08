import { CryptomancerActor } from "../actor/actor";
import { CellType } from "../actor/actor.enum";
import { Attribute, Core, CoreKey, Party, ResourceAttribute, Skill } from "../actor/actor.interface";
import { AttributeBarContext } from "../shared/components/components.interface";
import { CheckDifficulty } from "../skill-check/skill-check.enum";

export type CharacterSheetData = ActorSheet.Data & {
  checkDifficulty: CheckDifficulty;
  hpAttributeBar: AttributeBarContext;
  manaAttributeBar: AttributeBarContext;
  skills: Array<Skill & { attributeValue: number }>;
  partyOptions: StoredDocument<CryptomancerActor>[];
  selectedParty: Party | null;
  upgradePointsUsed: number;
  core: Record<CoreKey, Core & { attributes: Record<string, Attribute | ResourceAttribute> }>;
};

export type PartySheetData = ActorSheet.Data & {
  riskColor: string;
  cellTypes: Record<CellType, string>;
};
