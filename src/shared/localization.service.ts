import { getGame } from "../helpers/util";

export class LocalizationService {
  /**
   * Automatically prepends the key with CRYPTOMANCER.
   */
  localize(key: string): string {
    return getGame().i18n.localize(`CRYPTOMANCER.${key}`);
  }

  /**
   * Alias for localize.
   */
  get l() {
    return this.localize;
  }
}
