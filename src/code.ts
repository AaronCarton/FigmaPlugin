import { MessageTitle } from "./classes/messageTitles";
import {
  changeLayerVisibility,
  linkAnnotationToSourceNodes,
} from "./functions/annotationFunctions";
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
      checkInitState(payload);
      break;

    case MessageTitle.changeVisibility:
      changeLayerVisibility(event.value);
      break;

    default:
      break;
  }
};

figma.on("selectionchange", () => {
  if (figma.currentPage.selection[0] !== undefined) {
    linkAnnotationToSourceNodes.forEach((item) => {
      if (item.sourceNode === figma.currentPage.selection[0]) {
        console.log(item.data);
      }
    });
  }
});

figma.on("close", async () => {
  console.log("closing");
  AnnotationElements.annotationLayer.remove();
  figma.closePlugin();
});
