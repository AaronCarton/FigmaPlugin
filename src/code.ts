import { FigmaLocalStorage } from "./ui/figmaLocalStorage";
import { IfigmaMessage } from "./interfaces/interface.figmaObject";
const figmaLocalStorage = new FigmaLocalStorage();
class messageTitle {
  public static readonly changeTab: string = "changeTab";
  public static readonly connectionCheck: string = "connectionCheck";
}

figma.showUI(__html__, { width: 345, height: 250 });

//Dispatch all components -> in figma use postMessage
//Use the class names for initializeComponent
initializeComponent("FigmaLocalStorage");
initializeComponent("NavigationTabs");
initializeComponent("Settings");
initializeComponent("ConnectPanel");

figma.ui.onmessage = (event) => {
  const eventType = event.type;
  const selectedTab = event.tab;
  const connectionState = event.connection;

  if (eventType == messageTitle.changeTab) {
    switch (selectedTab) {
      case "connect":
        if (connectionState) {
          figma.ui.resize(345, 250);
        } else {
          figma.ui.resize(345, 124);
        }
        break;
      case "settings":
        figma.ui.resize(345, 235);
        break;
      case "usage":
        figma.ui.resize(345, 590);
        break;
      default:
        break;
    }
  }

  if (eventType == messageTitle.connectionCheck) {
    if (connectionState) {
      figma.ui.resize(345, 250);
    } else {
      figma.ui.resize(345, 124);
    }
  }
};

// deleteKeys(); //For testing purposes

// Listen for the 'setKeys' event
//This will receive the keys from the UI and set the keys in the storage
figma.ui.onmessage = (event) => {
  // Check if the event data is what you expect
  if (event.type === "setKeys") {
    // Handle the message
    figmaLocalStorage.setBaseUrl(event.baseURL);
    figmaLocalStorage.setClientKey(event.clientKey);
    figmaLocalStorage.setSourceKey(event.sourceKey);
  }
  if (event.type === "sendDataToUI") {
    console.log("sendDataToUI");
    figmaLocalStorage.retrieveBaseURLFromStorage();
  }
};

function initializeComponent(componentName: string): void {
  const figmaMessage: IfigmaMessage = {
    type: `initialize${componentName}`,
  };

  figma.ui.postMessage({ figmaMessage: figmaMessage });
}
