import { MessageTitle } from "./classes/messageTitles";
import { changeLayerVisibility, initAnnotations, sendDataToFrontend } from "./functions/annotationFunctions";
import { AnnotationElements } from "./classes/annotationElements";
import { loadFonts } from "./functions/loadFonts";
import { resizeByConnection, resizeByTab } from "./functions/reiszeFunctions";
import EventHub from "./services/events/EventHub";
import { Events } from "./services/events/Events";
import { createFigmaError } from "./functions/createError";
import Annotation, { IAnnotation } from "./interfaces/interface.annotation";
import { updateAnnotations } from "./functions/annotationFunctions";

figma.showUI(__html__, { width: 345, height: 250 });

figma.ui.on("message", (event) => {
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
      updateAnnotations(<Array<SceneNode>>figma.currentPage.selection, payload.values);
      break;

    case MessageTitle.changeVisibility:
      changeLayerVisibility(payload.state);
      break;

    default:
      break;
  }
});

// EventHub.getInstance().makeEvent(Events.DRAW_ANNOTATION, )

EventHub.getInstance().makeEvent(Events.SET_LOCAL_STORAGE, ({ baseURL, clientKey, sourceKey }) => {
  figma.clientStorage.setAsync("baseURL", baseURL);
  figma.clientStorage.setAsync("clientKey", clientKey);
  figma.clientStorage.setAsync("sourceKey", sourceKey);
});

EventHub.getInstance().makeEvent(Events.FETCH_LOCAL_STORAGE, async () => {
  const baseURL: string = (await figma.clientStorage.getAsync("baseURL")) || "";
  const clientKey: string = (await figma.clientStorage.getAsync("clientKey")) || "";
  const sourceKey: string = (await figma.clientStorage.getAsync("sourceKey")) || "";

  EventHub.getInstance().sendCustomEvent(Events.LOCAL_STORAGE_FETCHED, {
    baseURL,
    clientKey,
    sourceKey,
  });
});

EventHub.getInstance().makeEvent(Events.FETCH_PROJECT_KEY, () => {
  const projectKey = figma.fileKey;
  EventHub.getInstance().sendCustomEvent(Events.PROJECT_KEY_FETCHED, projectKey);
});

EventHub.getInstance().makeEvent(Events.CREATE_ANNOTATION, (annotation: IAnnotation) => {
  const projectKey = figma.fileKey;
  if (figma.currentPage.selection.length > 1) return createFigmaError("Only one node can be selected", 5000, true);
  const nodeId = figma.currentPage.selection[0].id;
  EventHub.getInstance().sendCustomEvent(Events.ANNOTATION_CREATED, { ...annotation, projectKey, nodeId });
});

EventHub.getInstance().makeEvent(Events.ANNOTATIONS_FETCHED, (annotations: Annotation[]) => {
  initAnnotations(annotations);
});

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
