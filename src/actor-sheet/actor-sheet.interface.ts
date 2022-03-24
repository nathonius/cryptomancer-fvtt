import { CheckDifficulty } from "../skill-check/skill-check.enum.js";

export type AugmentedData = ActorSheet.Data & {
  rollData: object;
  sheet: SheetData;
  gear: ActorSheetItem[];
  features: ActorSheetItem[];
  checkDifficulty: CheckDifficulty;
};

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
