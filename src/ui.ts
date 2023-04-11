import "./ui/navigation-tabs.ts";
import "./ui/settings";
import "./ui/initialize.ts";
import "./ui/connect-panel";

// Sends a message to code.ts
parent.postMessage(
  {
    pluginMessage: { type: "messageToFigma", tab: "connect" },
  },
  "*",
);
