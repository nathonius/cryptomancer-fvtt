import { SCOPE } from "../shared/constants";
import { getGame } from "../shared/util";
import type { SettingsKeys } from "./settings.constant";
import { Settings } from "./settings.constant";

export class SettingsService {
  registerSettings(): void {
    const game = getGame();
    // Register settings
    for (let setting in Settings) {
      console.log(`Registering setting ${setting}`);
      game.settings.register(SCOPE, setting, (Settings as Record<string, ClientSettings.PartialSetting>)[setting]);
    }
  }

  getSetting<T extends number | boolean | string>(key: SettingsKeys): T | null {
    return (getGame().settings.get(SCOPE, key) as T) ?? null;
  }

  updateSetting<T extends number | boolean | string>(key: SettingsKeys, value: T): void {
    getGame().settings.set(SCOPE, key, value);
  }
}
