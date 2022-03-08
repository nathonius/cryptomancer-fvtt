export enum CheckDifficulty {
  Trivial = 4,
  Challenging = 6,
  Tough = 8,
}

export enum CheckResult {
  DramaticFailure = -2,
  SolidFailure = -1,
  AlmostHadIt = 0,
  JustBarely = 1,
  SolidSuccess = 2,
  DramaticSuccess = 3,
}

export enum DieResult {
  None = "none",
  Hit = "hit",
  Botch = "botch",
}

export enum DieType {
  Attribute,
  Fate,
}
