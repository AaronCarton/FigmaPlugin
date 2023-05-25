import { changeLayerVisibility, archiveAnnotation, initAnnotations, sendDataToFrontend } from "./functions/annotationFunctions";
import { AnnotationElements } from "./classes/annotationElements";
import { loadFonts } from "./functions/loadFonts";
import { resizeByFilter, resizeByRemoveFilter, resizeByShowMore, resizeByTab } from "./functions/reiszeFunctions";
import EventHub from "./services/events/EventHub";
import { Events } from "./services/events/Events";
import Annotation, { IAnnotation } from "./interfaces/interface.annotation";
import { updateAnnotations } from "./functions/annotationFunctions";
import { stripODS } from "./interfaces/ods/interface.ODSresponse";
import { isLastUser, removeCurrentUser } from "./functions/multiUserManager";

figma.showUI(__html__, { width: 345, height: 296 });
let notification: NotificationHandler | undefined; // Store the current notification to be able to close it sooner

//////* UI EVENTS *//////
EventHub.getInstance().makeEvent(Events.UI_CHANGE_TAB, ({ tab, connection }) => resizeByTab(tab, connection));
EventHub.getInstance().makeEvent(Events.UI_CHANGE_VISIBILITY, (state) => changeLayerVisibility(state));
EventHub.getInstance().makeEvent(Events.UI_CHANGE_FILTER, (count) => resizeByFilter(count));
EventHub.getInstance().makeEvent(Events.UI_REMOVE_FILTER, (count) => resizeByRemoveFilter(count));
EventHub.getInstance().makeEvent(Events.UI_SHOW_MORE, ({ tab, isShowMoreActive }) => resizeByShowMore(tab, isShowMoreActive));

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
  EventHub.getInstance().sendCustomEvent(Events.PROJECT_KEY_FETCHED, projectKey || "null");
});

//////* ANNOTATION EVENTS *//////
EventHub.getInstance().makeEvent(Events.UPSERT_ANNOTATION, (annotation: IAnnotation) => {
  if (figma.currentPage.selection.length === 0)
    return EventHub.getInstance().sendCustomEvent(Events.FIGMA_MESSAGE, { message: "Select something to create an annotation." });
  if (figma.currentPage.selection.length > 1)
    return EventHub.getInstance().sendCustomEvent(Events.FIGMA_MESSAGE, { message: "Only one node can be selected." });
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
EventHub.getInstance().makeEvent(Events.FIGMA_MESSAGE, ({ message, type = "ERROR", duration, cancelPrevious = false }) => {
  if (cancelPrevious) notification?.cancel(); // Cancel the previous notification if it exists, to avoid stacking
  notification = figma.notify(message, {
    timeout: duration || 5000,
    error: type == "ERROR",
    onDequeue: () => (notification = undefined), // Remove the notification reference when it times out
  });
});

figma.on("selectionchange", () => {
  sendDataToFrontend();
});

figma.on("documentchange", (event: DocumentChangeEvent) => {
  event.documentChanges.forEach((change) => {
    if (change.type === "DELETE") {
      EventHub.getInstance().sendCustomEvent(Events.ARCHIVE_ANNOTATION, { nodeId: change.node.id } as IAnnotation);
    }
  });
});

figma.on("close", async () => {
  // Checking if user closing the plugin is the last user in the file (that uses the plugin).
  // If so, delete the annotion, otherwise delete user from user list
  const lastUser: boolean = isLastUser();
  if (lastUser) {
    AnnotationElements.annotationLayer.remove();
    removeCurrentUser();
    figma.root.setPluginData("MP_currentUser", "");
  } else {
    removeCurrentUser();
  }

  figma.closePlugin();
});

//////* INITIALIZATION FONTS *//////
loadFonts();

//////* INITIALIZATION UI COMPONENTS *//////
["Settings", "NavigationTabs", "ConnectPanel", "FilterPanel"].forEach((componentName) => {
  console.log(`initialize${componentName}`);

  EventHub.getInstance().sendCustomEvent(Events.UI_INITIALIZE_COMPONENT, componentName);
});
