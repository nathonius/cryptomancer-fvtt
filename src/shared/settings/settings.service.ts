import { SYSTEM } from "../constants";
import { getGame } from "../util";
import { SettingsKeys, Settings } from "./settings.constant";

export class SettingsService {
  static registerSettings(): void {
    const game = getGame();
    // Register settings
    for (let setting in Settings) {
      console.log(`Registering setting ${setting}`);
      game.settings.register(SYSTEM, setting, (Settings as Record<string, ClientSettings.PartialSetting>)[setting]);
    }
  }

  static getSetting<T extends number | boolean | string>(key: SettingsKeys): T | null {
    return (getGame().settings.get(SYSTEM, key) as T) ?? null;
  }

  static updateSetting<T extends number | boolean | string>(key: SettingsKeys, value: T): void {
    getGame().settings.set(SYSTEM, key, value);
  }
}
