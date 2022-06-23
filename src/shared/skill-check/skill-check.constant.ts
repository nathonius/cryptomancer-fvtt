export enum CheckDifficulty {
  Trivial = 4,
  Challenging = 6,
  Tough = 8,
}

// Mapping from number to string
export const CheckDifficultyLabel = {
  [CheckDifficulty.Trivial]: "trivial",
  [CheckDifficulty.Challenging]: "challenging",
  [CheckDifficulty.Tough]: "tough",
};

export enum CheckResult {
  DramaticFailure = -2,
  SolidFailure = -1,
  AlmostHadIt = 0,
  JustBarely = 1,
  SolidSuccess = 2,
  DramaticSuccess = 3,
}

//Mapping from number to string
export const CheckResultLabel = {
  [CheckResult.DramaticFailure]: "dramaticFailure",
  [CheckResult.SolidFailure]: "solidFailure",
  [CheckResult.AlmostHadIt]: "almostHadIt",
  [CheckResult.JustBarely]: "justBarely",
  [CheckResult.SolidSuccess]: "solidSuccess",
  [CheckResult.DramaticSuccess]: "dramaticSuccess",
};

export enum DieResult {
  None = "none",
  Hit = "hit",
  Botch = "botch",
}

export enum DieType {
  Attribute = "attribute",
  Fate = "fate",
}
