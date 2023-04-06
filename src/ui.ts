import "./ui/navigation-tabs.ts";
import "./ui/settings";
import "./ui/initialize.ts";
import "./ui/connect-panel";

// Send a message to code.ts
// parent.postMessage({ pluginMessage: { type: "sendYey", payload: "yey to you" } }, "*");
parent.postMessage(
  {
    pluginMessage: { type: "messageToFigma", tab: "connect" },
  },
  "*",
);
