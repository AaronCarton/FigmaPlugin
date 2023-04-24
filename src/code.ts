import { FigmaLocalStorage } from "./ui/figmaLocalStorage";
const figmaLocalStorage = new FigmaLocalStorage();
class messageTitle {
  public static readonly changeTab: string = "changeTab";
  public static readonly connectionCheck: string = "connectionCheck";
}

figma.showUI(__html__, { width: 345, height: 250 });

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

async function getBaseURL(): Promise<string> {
  console.log("in getBaseUrl", await figma.clientStorage.getAsync("baseURL"));
  return await figma.clientStorage.getAsync("baseURL");
}

figmaLocalStorage.retrieveBaseURLFromStorage();
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
  // Catch event from initializeEvents()
  if (event.type === "ListingInUI") {
    const eventData = {
      baseURL: "Sample baseURL", // needs an async function
      // clientKey: this.retrieveClientKeyFromStorage() as Promise<void>,
      // sourcekey: this.retrieveSourceKeyFromStorage() as Promise<void>,
    };
    // const keyValuesRetrievedEvent = new CustomEvent("keyValuesRetrieved", {
    //   detail: eventData,
    // });

    figma.ui.postMessage({ eventData, type: "keyValuesRetrieved" });
    console.log("codets: " + eventData.baseURL); // Is still a Promise object...

    // window.dispatchEvent(keyValuesRetrievedEvent); //window bestaat niet in code.ts
  }
};
//Dispatch all components -> in figma use postMessage
//Use the class names for initializeComponent
initializeComponent("Settings");
initializeComponent("NavigationTabs");
initializeComponent("ConnectPanel");

function initializeComponent(componentName: string): void {
  figma.ui.postMessage({
    pluginMessage: { type: `initialize${componentName}` },
  });
}
