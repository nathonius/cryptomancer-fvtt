export interface Character {
  core: {
    wits: Core & {
      attributes: {
        knowledge: Attribute & {
          skills: {
            alchemy: Skill;
            craft: Skill;
            medicine: Skill;
            query: Skill;
          };
        };
        cunning: Attribute & {
          skills: {
            deception: Skill;
            scrounge: Skill;
            tracking: Skill;
            traps: Skill;
          };
        };
      };
    };
    resolve: Core & {
      attributes: {
        presence: Attribute & {
          skills: {
            beastKen: Skill;
            charm: Skill;
            menace: Skill;
            performance: Skill;
          };
        };
        willpower: Attribute & {
          skills: undefined;
        };
      };
    };
    speed: Core & {
      attributes: {
        agility: Attribute & {
          skills: {
            acrobatics: Skill;
            athletics: Skill;
            escapeArtistry: Skill;
            stealth: Skill;
          };
        };
        dexterity: Attribute & {
          skills: {
            firedMissile: Skill;
            lockPicking: Skill;
            preciseMissile: Skill;
            sleightOfHand: Skill;
          };
        };
      };
    };
    power: Core & {
      attributes: {
        strength: Attribute & {
          skills: {
            bruteMelee: Skill;
            featOfStrength: Skill;
            thrownMissile: Skill;
            unarmedMelee: Skill;
          };
        };
        endurance: Attribute & {
          skills: undefined;
        };
      };
    };
  };
  biography: {
    race: string;
    trueName: string;
    pronouns: string;
    build: string;
    eyes: string;
    hair: string;
    skin: string;
    desires: string;
    fears: string;
    tendsTo: string;
    usedTo: string;
  };
  healthPoints: {
    value: number;
    max: number;
  };
  manaPoints: {
    min: number;
    value: number;
    max: number;
  };
  upgradePoints: {
    value: number;
  };
}

export interface Core {
  label: string;
  min: number;
  value: number;
  max: number;
}

export interface Attribute {
  label: string;
  core: string;
  min: number;
  value: number;
  max: number;
}

export interface Skill {
  label: string;
  attribute: string;
  break: boolean;
  push: boolean;
}
