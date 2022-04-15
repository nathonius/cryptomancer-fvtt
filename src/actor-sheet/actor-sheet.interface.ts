import type { CheckDifficulty } from "../skill-check/skill-check.enum";

// TODO: Are all these properties being used?
export type AugmentedData = ActorSheet.Data & {
  rollData: object;
  sheet: SheetData;
  gear: ActorSheetItem[];
  features: ActorSheetItem[];
  checkDifficulty: CheckDifficulty;
};

// TODO: Are all these properties being used?
export interface SheetData {
  triad: {
    speed: {
      key: string;
      value: number;
      name: string;
      attributes: {
        agility: {
          key: string;
          value: number;
          name: string;
        };
        dexterity: {
          key: string;
          value: number;
          name: string;
        };
      };
    };
    power: {
      key: string;
      value: number;
      name: string;
      attributes: {
        strength: {
          key: string;
          value: number;
          name: string;
        };
        endurance: {
          key: string;
          value: number;
          name: string;
        };
      };
    };
    wits: {};
    resolve: {};
  };
}
