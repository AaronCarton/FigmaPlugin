import "./ui/navigation-tabs.ts";
import "./ui/connect-panel";
import "./ui/figmaLocalStorage";

// const figmaLocalStorage = new FigmaLocalStorage();
// figmaLocalStorage.initializeEvents();

import "./ui/settings";
// Sends a message to code.ts
parent.postMessage(
  {
    pluginMessage: { type: "messageToFigma", tab: "connect" },
  },
  "*",
);
