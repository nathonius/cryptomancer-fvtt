import { getGame } from "../shared/util.js";
import { Settings, SettingsKeys, Module } from "./settings.constant.js";

export class SettingsService {
  registerSettings(): void {
    const game = getGame();
    // Register settings
    for (let setting in Settings) {
      game.settings.register(
        Module,
        setting,
        (Settings as Record<string, ClientSettings.PartialSetting>)[setting]
      );
    }
  }

  getSetting<T extends number | boolean | string>(key: SettingsKeys): T | null {
    return (getGame().settings.get(Module, key) as T) ?? null;
  }

  updateSetting<T extends number | boolean | string>(
    key: SettingsKeys,
    value: T
  ): void {
    getGame().settings.set(Module, key, value);
  }
}
