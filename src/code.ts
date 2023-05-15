import { MessageTitle } from "./classes/messageTitles";
import { changeLayerVisibility, archiveAnnotation, initAnnotations, sendDataToFrontend } from "./functions/annotationFunctions";
import { AnnotationElements } from "./classes/annotationElements";
import { loadFonts } from "./functions/loadFonts";
import { resizeByConnection, resizeByTab } from "./functions/reiszeFunctions";
import EventHub from "./services/events/EventHub";
import { Events } from "./services/events/Events";
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
EventHub.getInstance().makeEvent(Events.SET_LOCAL_STORAGE, ({ baseURL, clientKey, sourceKey, lastUpdate }) => {
  figma.clientStorage.setAsync("baseURL", baseURL);
  figma.clientStorage.setAsync("clientKey", clientKey);
  figma.clientStorage.setAsync("sourceKey", sourceKey);
  figma.clientStorage.setAsync("lastUpdate", lastUpdate);
});

EventHub.getInstance().makeEvent(Events.FETCH_LOCAL_STORAGE, async () => {
  const baseURL: string = (await figma.clientStorage.getAsync("baseURL")) || "";
  const clientKey: string = (await figma.clientStorage.getAsync("clientKey")) || "";
  const sourceKey: string = (await figma.clientStorage.getAsync("sourceKey")) || "";
  const lastUpdate: string = (await figma.clientStorage.getAsync("lastUpdate")) || "";

  EventHub.getInstance().sendCustomEvent(Events.LOCAL_STORAGE_FETCHED, {
    baseURL,
    clientKey,
    sourceKey,
    lastUpdate,
  });
});

//////* PROJECT KEY EVENTS *//////
EventHub.getInstance().makeEvent(Events.FETCH_PROJECT_KEY, () => {
  const projectKey = figma.fileKey;
  EventHub.getInstance().sendCustomEvent(Events.PROJECT_KEY_FETCHED, projectKey);
});

//////* ANNOTATION EVENTS *//////
EventHub.getInstance().makeEvent(Events.UPSERT_ANNOTATION, (annotation: IAnnotation) => {
  if (figma.currentPage.selection.length === 0)
    return EventHub.getInstance().sendCustomEvent(Events.FIGMA_ERROR, "Select something to create an annotation.");
  if (figma.currentPage.selection.length > 1) return EventHub.getInstance().sendCustomEvent(Events.FIGMA_ERROR, "Only one node can be selected.");
  annotation.projectKey = figma.fileKey || "";
  annotation.nodeId = figma.currentPage.selection[0].id;

  EventHub.getInstance().sendCustomEvent(Events.ANNOTATION_UPSERTED, annotation);
});

EventHub.getInstance().makeEvent(Events.ANNOTATIONS_FETCHED, (annotations: Annotation[]) => {
  initAnnotations(annotations);

  const textNodes = figma.currentPage.findAllWithCriteria({
    types: ["TEXT"],
  });

  textNodes.forEach((textNode) => {
    annotations.forEach((annotation) => {
      if (textNode.id === annotation.nodeId) {
        if (textNode.characters !== annotation.value) {
          const textNodeCharacters = textNode.characters;
          EventHub.getInstance().sendCustomEvent(Events.UPDATE_ANNOTATION_BY_TEXTNODE, { textNodeCharacters, annotation });
        }
      }
    });
  });
});

EventHub.getInstance().makeEvent(Events.DRAW_ANNOTATION, (annotation: Annotation) => {
  updateAnnotations(<Array<SceneNode>>figma.currentPage.selection, stripODS(annotation));
});

EventHub.getInstance().makeEvent(Events.UPDATE_NODETEXT_FROM_ODS, (sampleValue: string) => {
  if (figma.currentPage.selection.length === 1) {
    if (figma.currentPage.selection[0].type === "TEXT") {
      figma.currentPage.selection[0].characters = sampleValue;
    }
  }
});

EventHub.getInstance().makeEvent(Events.INIT_ARCHIVE_ANNOTATION, (annotation: IAnnotation) => {
  annotation.projectKey = figma.fileKey || "";
  annotation.nodeId = figma.currentPage.selection[0].id;
  EventHub.getInstance().sendCustomEvent(Events.ARCHIVE_ANNOTATION, annotation);
});

EventHub.getInstance().makeEvent(Events.ANNOTATION_ARCHIVED, (annotation: Annotation) => {
  archiveAnnotation(annotation);
});

//////* FIGMA EVENTS *//////
EventHub.getInstance().makeEvent(Events.FIGMA_ERROR, (error: string) => figma.notify(error, { timeout: 5000, error: true }));

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
