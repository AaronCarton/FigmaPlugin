//look for the area occupied by the user
//make everything in that viewport visible
//annotation layer will change based on the user => 2 users will make 2 "viewports" in the annotation layer => how to handle so that when one is viewing the other doesn't hide his annotations
//use linkAnnotationToSourceNodes from annotationfunctions?
import { viewportObject } from "../interfaces/viewportObject";
import { annotationLinkItem } from "../interfaces/annotationLinkItem";
import { linkAnnotationToSourceNodes } from "./annotationFunctions";

function isBetween(x: number, min: number, max: number) {
  console.log("ISBETWEEN: ", min, " | ", x, " | ", max);
  console.log(Math.abs(x) >= Math.abs(min) && Math.abs(x) <= Math.abs(max));
  return Math.abs(x) >= Math.abs(min) && Math.abs(x) <= Math.abs(max);
}

function isItemInViewport(item: annotationLinkItem, viewport: viewportObject) {
  const itemBoundingBox = item.sourceNode.absoluteBoundingBox;
  if (itemBoundingBox === null) {
    return false;
  }
  if (itemBoundingBox.x < viewport.topLeft.x) {
    return false;
  }
  if (
    isBetween(itemBoundingBox.x, viewport.topLeft.x, viewport.topRight.x) &&
    isBetween(itemBoundingBox.y, viewport.bottomLeft.y, viewport.topLeft.y)
  ) {
    return true;
  }
}

function determineViewports() {
  if (linkAnnotationToSourceNodes) {
    linkAnnotationToSourceNodes.forEach((element) => {
      if (element.vector === undefined) {
        return null;
      }
      const foundAnnotation = figma.currentPage.findOne((x) => x.id === element.annotation.id);
      const foundVector = figma.currentPage.findOne((x) => x.id === element.vector.id);
      if (foundVector && foundAnnotation) {
        foundVector.visible = false;
        foundAnnotation.visible = false;
      }
    });
  }

  //Coords left top, right top, right under, left under.
  const currentviewPortData = figma.viewport.bounds;
  const currentviewPort: viewportObject = {
    topLeft: { x: currentviewPortData.x, y: currentviewPortData.y },
    topRight: { x: currentviewPortData.x + currentviewPortData.width, y: currentviewPortData.y },
    bottomRight: {
      x: currentviewPortData.x + currentviewPortData.width,
      y: currentviewPortData.y + currentviewPortData.height,
    },
    bottomLeft: { x: currentviewPortData.x, y: currentviewPortData.y + currentviewPortData.height },
  };

  //Loop through annotations and check if they are in the viewport.
  const filtered = linkAnnotationToSourceNodes.filter((element) => {
    return isItemInViewport(element, currentviewPort);
  });

  //Get items in figma corresponding to the sourcenodes that are in the viewport.
  filtered.forEach((element) => {
    const foundAnnotation = figma.currentPage.findOne((x) => x.id === element.annotation.id);
    const foundVector = figma.currentPage.findOne((x) => x.id === element.vector.id);
    if (foundAnnotation !== null && foundVector !== null) {
      foundVector.visible = true;
      foundAnnotation.visible = true;
    }
  });
}

export function viewportManager() {
  determineViewports();

  //On:zoom event doesn't exist in figma plugin API, most frequent event we can get is on:documentChange.
  figma.on("documentchange", () => viewportManager);
}
