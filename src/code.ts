import { MessageTitle } from "./classes/messageTitles";
import {
  changeLayerVisibility,
  checkIfAnnotationExists,
  deleteAnnotation,
  initAnnotations,
  sendDataToFrontend,
} from "./functions/annotationFunctions";
import { AnnotationElements } from "./classes/annotationElements";
import { loadFonts } from "./functions/loadFonts";
import { resizeByConnection, resizeByTab } from "./functions/reiszeFunctions";
import EventHub from "./services/events/EventHub";
import { Events } from "./services/events/Events";
import { createFigmaError } from "./functions/createError";
import Annotation, { IAnnotation } from "./interfaces/interface.annotation";
import { updateAnnotations } from "./functions/annotationFunctions";
import { stripODS } from "./interfaces/ods/interface.ODSresponse";

figma.showUI(__html__, { width: 345, height: 296 });

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

//////* LOCAL STORAGE EVENTS *//////
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

//////* PROJECT KEY EVENTS *//////
EventHub.getInstance().makeEvent(Events.FETCH_PROJECT_KEY, () => {
  const projectKey = figma.fileKey;
  EventHub.getInstance().sendCustomEvent(Events.PROJECT_KEY_FETCHED, projectKey);
});

//////* ANNOTATION EVENTS *//////
EventHub.getInstance().makeEvent(Events.UPSERT_ANNOTATION, (annotation: IAnnotation) => {
  if (figma.currentPage.selection.length === 0) return createFigmaError("Select something to create an annotation.", 5000, true);
  if (figma.currentPage.selection.length > 1) return createFigmaError("Only one node can be selected.", 5000, true);
  annotation.projectKey = figma.fileKey || "";
  annotation.nodeId = figma.currentPage.selection[0].id;
  EventHub.getInstance().sendCustomEvent(Events.ANNOTATION_UPSERTED, annotation);
});

EventHub.getInstance().makeEvent(Events.ANNOTATIONS_FETCHED, (annotations: Annotation[]) => {
  initAnnotations(annotations);
});

EventHub.getInstance().makeEvent(Events.DRAW_ANNOTATION, (annotation: Annotation) => {
  updateAnnotations(<Array<SceneNode>>figma.currentPage.selection, stripODS(annotation));
});

EventHub.getInstance().makeEvent(Events.INIT_ARCHIVE_ANNOTATION, (annotation: IAnnotation) => {
  annotation.projectKey = figma.fileKey || "";
  annotation.nodeId = figma.currentPage.selection[0].id;
  EventHub.getInstance().sendCustomEvent(Events.ARCHIVE_ANNOTATION, annotation);
});

EventHub.getInstance().makeEvent(Events.ANNOTATION_ARCHIVED, (annotation: Annotation) => {
  deleteAnnotation(annotation);
});

//////* FIGMA EVENTS *//////
figma.on("selectionchange", () => {
  sendDataToFrontend();
});

figma.on("documentchange", (event: DocumentChangeEvent) => {
  console.log("documentchange", event);
  event.documentChanges.forEach((change) => {
    if (change.type === "DELETE") {
      EventHub.getInstance().sendCustomEvent(Events.ARCHIVE_ANNOTATION, { nodeId: change.node.id });
    }
  });
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
