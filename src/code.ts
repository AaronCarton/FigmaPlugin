import { MessageTitle } from "./classes/messageTitles";
import { changeLayerVisibility, sendDataToFrontend } from "./functions/annotationFunctions";
import { AnnotationElements } from "./classes/annotationElements";
import { loadFonts } from "./functions/loadFonts";
import { resizeByConnection, resizeByTab } from "./functions/reiszeFunctions";
import { checkInitState } from "./functions/checkInitFunction";

figma.showUI(__html__, { width: 345, height: 250 });

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
