// const figmaLocalStorage = new FigmaLocalStorage();
// figmaLocalStorage.initializeEvents();
import { NavigationTabs } from "./ui/navigation-tabs";
import { Settings } from "./ui/settings";
import { ConnectPanel } from "./ui/connect-panel";

new Settings();
new NavigationTabs();
new ConnectPanel();

parent.postMessage(
  {
    pluginMessage: { type: "messageToFigma", tab: "connect" },
  },
  "*",
);
