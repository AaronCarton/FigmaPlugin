//to investigate: 2 users will make 2 "viewports" in the annotation layer => how to handle so that when one is viewing the other doesn't hide his annotations
import { viewportObject } from "../interfaces/viewportObject";
import { annotationLinkItem } from "../interfaces/annotationLinkItem";
import { linkAnnotationToSourceNodes } from "./annotationFunctions";

function isBetween(x: number, min: number, max: number) {
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

function determineViewports(documentChanges: DocumentChange[]) {
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

  // First filter annotations by origin
  // Remote = other user in the document made the change => dont run current users plugin on changes made by other user
  let filtered = linkAnnotationToSourceNodes.filter((element) => {
    const found = documentChanges.find((x) => x.id === element.sourceNode.id);
    // Element not found in annotationNodes => skip
    if (found === undefined) {
      return false;
    }

    if (found?.origin === "REMOTE") {
      return false;
    } else {
      return true;
    }
  });
  console.log("filtered", filtered);
  // Loop through filtered annotations and check if they are in the viewport.
  filtered = linkAnnotationToSourceNodes.filter((element) => {
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

export function viewportManager(event: DocumentChangeEvent) {
  determineViewports(event.documentChanges);
}
