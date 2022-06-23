import { registerHandlebarsHelpers } from "./shared/handlebars";
import * as Hook from "./shared/hooks";
import "./cryptomancer.scss";

// This can happen at any point
registerHandlebarsHelpers();

// Setup, called once
Hooks.once("init", Hook.init);
Hooks.once("ready", Hook.ready);
Hooks.once("devModeReady", Hook.devModeReady);

// Hooks, called every time
Hooks.on("renderChatLog", Hook.renderChatLog);
Hooks.on("renderChatMessage", Hook.renderChatMessage);
Hooks.on("renderDialog", Hook.renderDialog);
