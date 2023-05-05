import { annotationElements } from "../classes/annotationElements";

export default function createMask() {
  const maskArea = figma.createRectangle();
  const maskFound = <GroupNode>figma.currentPage.findOne((x) => x.name === "AnnotationMasks");
  let group: GroupNode | null = null;
  if (maskFound === undefined && maskFound !== null) {
    group = figma.group([annotationElements.annotationLayer], figma.currentPage);
    group.name = "AnnotationMasks";
  } else {
    if (maskFound !== null) {
      group = maskFound;
    } else {
      return;
    }
  }
  if (group !== null) {
    group.insertChild(group.children.length - 1, maskArea);
    console.log("FIGMA VIEWPORT", figma.viewport.bounds);
    maskArea.x = figma.viewport.bounds.x;
    maskArea.y = figma.viewport.bounds.y;
    maskArea.resize(figma.viewport.bounds.width, figma.viewport.bounds.height);
    maskArea.isMask = true;
    //Update every 2.5 sec.
    setInterval(() => {
      maskArea.x = figma.viewport.bounds.x;
      maskArea.y = figma.viewport.bounds.y;
      maskArea.resize(figma.viewport.bounds.width, figma.viewport.bounds.height);
    }, 2500);
  } else {
    return;
  }
}
