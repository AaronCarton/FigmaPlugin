import "./ui/navigation-tabs.ts";
import "./ui/settings";
import "./ui/connect-panel";
import { FigmaLocalStorage } from "./ui/figmaLocalStorage";

const figmaLocalStorage = new FigmaLocalStorage();
figmaLocalStorage.initializeEvents();
// Sends a message to code.ts
parent.postMessage(
  {
    pluginMessage: { type: "messageToFigma", tab: "connect" },
  },
  "*",
);
