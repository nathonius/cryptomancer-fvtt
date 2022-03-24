export function getGame(): Game {
  if (!(game instanceof Game)) {
    throw new Error("game is not initialized yet!");
  }
  return game;
}

/**
 * Automatically prepends the key with CRYPTOMANCER.
 */
export function l(key: string): string {
  return getGame().i18n.localize(`CRYPTOMANCER.${key}`);
}
