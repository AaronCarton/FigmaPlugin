import EventHub from "./services/events/EventHub";
import { Events } from "./services/events/Events";

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
        console.log(connectionState);
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

  if (event.type === EventHub.getInstance().prefixEventName(Events.FETCH_LOCAL_STORAGE)) {
    // TODO: try to find a way to use EventHub functions instead (without getting 'X is not a function' error)
    figma.clientStorage.getAsync("baseURL").then((baseURL) => {
      figma.clientStorage.getAsync("clientKey").then((clientKey) => {
        figma.clientStorage.getAsync("sourceKey").then((sourceKey) => {
          figma.ui.postMessage({
            type: EventHub.getInstance().prefixEventName(Events.LOCAL_STORAGE_FETCHED),
            message: {
              baseURL,
              clientKey,
              sourceKey,
            },
          });
        });
      });
    });
  }

  if (event.type === EventHub.getInstance().prefixEventName(Events.SET_LOCAL_STORAGE)) {
    const { baseURL, clientKey, sourceKey } = event.message;
    figma.clientStorage.setAsync("baseURL", baseURL);
    figma.clientStorage.setAsync("clientKey", clientKey);
    figma.clientStorage.setAsync("sourceKey", sourceKey);
  }
};

// Dispatch all components -> in figma use postMessage
// Use the class names for initializeComponent
initializeComponent("Settings");
initializeComponent("NavigationTabs");
initializeComponent("ConnectPanel");

function initializeComponent(componentName: string): void {
  figma.ui.postMessage({ type: `initialize${componentName}` });
}
