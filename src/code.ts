import { messageTitle } from "./classes/messageTitles";
import { changeLayerVisibility, initAnnotations } from "./functions/annotationFunctions";
import { annotationElements } from "./classes/annotationElements";
import { loadFonts } from "./functions/loadFonts";

figma.showUI(__html__, { width: 345, height: 250 });

figma.ui.onmessage = (event) => {
  const eventType = event.type;
  const selectedTab = event.tab;
  const connectionState = event.connection;

  loadFonts();

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
        figma.ui.resize(345, 355);
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

  if (eventType == messageTitle.createText) {
    initAnnotations(event.values);
  }

  if (eventType == messageTitle.changeVisibility) {
    changeLayerVisibility(event.value);
    // console.log(event.value);
  }
};

figma.on("close", async () => {
  console.log("closing");
  annotationElements.annotationLayer.remove();
  figma.closePlugin();
});
