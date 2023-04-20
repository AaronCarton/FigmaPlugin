import { MessageTitle } from "./classes/messageTitles";
import { changeLayerVisibility, initAnnotations } from "./functions/annotationFunctions";
import { AnnotationElements } from "./classes/annotationElements";
import { loadFonts } from "./functions/loadFonts";

figma.showUI(__html__, { width: 345, height: 250 });

figma.ui.onmessage = (event) => {
  const eventType = event.type;
  const selectedTab = event.tab;
  const connectionState = event.connection;

  loadFonts();

  if (eventType == MessageTitle.changeTab) {
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
        figma.ui.resize(345, 355);
        break;
      case "usage":
        figma.ui.resize(345, 590);
        break;
      default:
        break;
    }
  }

  if (eventType == MessageTitle.connectionCheck) {
    if (connectionState) {
      figma.ui.resize(345, 250);
    } else {
      figma.ui.resize(345, 124);
    }
  }

  if (eventType == MessageTitle.createText) {
    initAnnotations(event.values);
  }

  if (eventType == MessageTitle.changeVisibility) {
    changeLayerVisibility(event.value);
  }
};

figma.on("close", async () => {
  console.log("closing");
  AnnotationElements.annotationLayer.remove();
  figma.closePlugin();
});
