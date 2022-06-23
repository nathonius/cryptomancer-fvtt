import { SYSTEM } from "../constants";

export function devModeReady(devMode: any): void {
  devMode.registerPackageDebugFlag(SYSTEM);
}
