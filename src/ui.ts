// const figmaLocalStorage = new FigmaLocalStorage();
// figmaLocalStorage.initializeEvents();
import { NavigationTabs } from "./ui/navigation-tabs";
import { Settings } from "./ui/settings";
import { ConnectPanel } from "./ui/connect-panel";
import { FigmaLocalStorage } from "./ui/figmaLocalStorage";

new FigmaLocalStorage().initEventlistener();
new NavigationTabs();
new Settings();
new ConnectPanel();

parent.postMessage(
  {
    pluginMessage: { type: "messageToFigma", tab: "connect" },
  },
  "*",
);
