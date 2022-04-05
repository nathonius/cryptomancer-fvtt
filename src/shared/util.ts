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

export function log(args: any, force = false) {
  try {
    const isDebugging = (
      getGame().modules.get("_dev-mode") as any
    )?.api?.getPackageDebugValue("cryptomancer");

    if (force || isDebugging) {
      if (typeof args === "string") {
        console.log("cryptomancer", "|", args);
      } else {
        console.log("cryptomancer", "|", ...args);
      }
    }
  } catch (e) {}
}
