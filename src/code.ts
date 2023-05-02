import { MessageTitle } from "./classes/messageTitles";
import { changeLayerVisibility, initAnnotations, sendDataToFrontend } from "./functions/annotationFunctions";
import { AnnotationElements } from "./classes/annotationElements";
import { loadFonts } from "./functions/loadFonts";
import { resizeByConnection, resizeByTab } from "./functions/reiszeFunctions";
import { checkInitState } from "./functions/checkInitFunction";
import EventHub from "./services/events/EventHub";
import { Events } from "./services/events/Events";

figma.showUI(__html__, { width: 345, height: 250 });
figma.on("selectionchange", () => console.log(figma.currentPage.selection));
figma.ui.onmessage = (event) => {
  const eventType = event.type;
  const payload = event.payload;

  loadFonts();

  switch (eventType) {
    case MessageTitle.changeTab:
      resizeByTab(payload.tab, payload.connection);
      break;

    case MessageTitle.connectionCheck:
      resizeByConnection(payload.connection);
      break;

    case MessageTitle.createText:
      checkInitState(payload.values);
      break;

    case MessageTitle.changeVisibility:
      changeLayerVisibility(payload.state);
      break;

    default:
      break;
  }

  if (event.type === EventHub.getInstance().prefixEventName(Events.FETCH_LOCAL_STORAGE)) {
    // TODO: try to find a way to use EventHub functions instead (without getting 'X is not a function' error)
    figma.clientStorage.getAsync("baseURL").then((baseURL) => {
      figma.clientStorage.getAsync("clientKey").then((clientKey) => {
        figma.clientStorage.getAsync("sourceKey").then((sourceKey) => {
          //TODO: check if localStorage is empty in separate function next sprint
          if (baseURL !== undefined || clientKey !== undefined || sourceKey !== undefined) {
            figma.ui.postMessage({
              type: EventHub.getInstance().prefixEventName(Events.LOCAL_STORAGE_FETCHED),
              message: {
                baseURL,
                clientKey,
                sourceKey,
              },
            });
          } else {
            figma.ui.postMessage({
              type: EventHub.getInstance().prefixEventName(Events.LOCAL_STORAGE_FETCHED),
              message: {
                baseURL: "t",
                clientKey: "",
                sourceKey: "",
              },
            });
          }
        });
      });
    });
  }

  if (event.type === EventHub.getInstance().prefixEventName(Events.DATA_INITIALIZED)) {
    initAnnotations(event.message);
  }

  if (event.type === EventHub.getInstance().prefixEventName(Events.SET_LOCAL_STORAGE)) {
    const { baseURL, clientKey, sourceKey } = event.message;
    figma.clientStorage.setAsync("baseURL", baseURL);
    figma.clientStorage.setAsync("clientKey", clientKey);
    figma.clientStorage.setAsync("sourceKey", sourceKey);
  }
};

figma.on("selectionchange", () => {
  sendDataToFrontend();
});

figma.on("close", async () => {
  console.log("closing");
  AnnotationElements.annotationLayer.remove();
  figma.closePlugin();
});
// Dispatch all components -> in figma use postMessage
// Use the class names for initializeComponent
initializeComponent("Settings");
initializeComponent("NavigationTabs");
initializeComponent("ConnectPanel");

function initializeComponent(componentName: string): void {
  figma.ui.postMessage({ type: `initialize${componentName}` });
}
