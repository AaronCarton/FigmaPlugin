import { frame } from "../interfaces/frame";
import { AnnotationElements } from "../classes/annotationElements";
import { PropertizeConstants } from "../classes/propertizeConstants";
import { AnnotationInput } from "../interfaces/annotations";
import { createFigmaError } from "./createError";
import { annotationLinkItem } from "../interfaces/annotationLinkItem";
export const linkAnnotationToSourceNodes: Array<annotationLinkItem> = [];

function createAnnotation(inputValues: AnnotationInput) {
  const page = figma.currentPage;
  const frame = figma.createFrame();
  frame.resize(320, 130);
  page.appendChild(frame);

  frame.fills = [{ type: "SOLID", color: PropertizeConstants.figmaLightBlue }];
  frame.strokes = [{ type: "SOLID", color: PropertizeConstants.figmaDarkBlue }];
  frame.strokeWeight = 1;
  frame.strokeAlign = "CENTER";
  frame.strokeCap = "ROUND";
  frame.strokeJoin = "ROUND";
  frame.dashPattern = [10, 5];
  frame.cornerRadius = 10;

  const textTitles = ["Data source", "Entity", "Attribute", "Data type", "Sample value"];
  const textValues = [
    inputValues.dataSrc,
    inputValues.entity,
    inputValues.attribute,
    inputValues.dataType,
    inputValues.sampleValue,
  ];

  textTitles.forEach((title, index) => {
    const titlesNode = figma.createText();
    titlesNode.name = title;
    titlesNode.characters = title;
    titlesNode.fontSize = 11;
    titlesNode.x = 15;
    titlesNode.y = 22 * index + 15;
    titlesNode.fontName = { family: "Inter", style: "Semi Bold" };
    titlesNode.fills = [{ type: "SOLID", color: PropertizeConstants.figmaBlack }];
    frame.appendChild(titlesNode);
  });

  textValues.forEach((title, index) => {
    const valuesNode = figma.createText();
    valuesNode.name = title;
    valuesNode.characters = title;
    valuesNode.fontSize = 11;
    valuesNode.x = 105;
    valuesNode.y = 22 * index + 15;
    valuesNode.fills = [{ type: "SOLID", color: PropertizeConstants.figmaBlack }];
    frame.appendChild(valuesNode);
  });

  frame.locked = true;
  frame.visible = true;
  return frame;
}

function determineFrameSide(elem: SceneNode, parentFrame: FrameNode) {
  if (elem.absoluteTransform[0][2] < parentFrame.absoluteTransform[0][2] + parentFrame.width / 2) {
    return "left";
  } else {
    return "right";
  }
}

function sortNodesAccordingToYCoords(sourceNodes: Array<SceneNode>) {
  // By sorting the nodes according to y coords we can simply say i-1 and mean the node above in the file (preventing multiple search operations to look if there is a node that has an absolute difference of less than the annotation height and thus overlapping).
  const sorted: Array<SceneNode> = sourceNodes.slice().sort((a: SceneNode, b: SceneNode) => {
    if (a.y < b.y) {
      return -1;
    }
    return 0;
  });
  return sorted;
}

function determineParentFrame(elem: SceneNode) {
  let parentFrame: SceneNode = elem;
  // Look for current frame.
  while (parentFrame.parent !== null && parentFrame.parent !== AnnotationElements.currentpage) {
    parentFrame = <SceneNode>parentFrame.parent;
  }
  return parentFrame;
}

function makeFramesArray() {
  console.log("Making frame array...");
  const selection = <Array<SceneNode>>AnnotationElements.currentpage.selection;
  if (selection.length > 0) {
    sortNodesAccordingToYCoords(selection);

    for (let i = 0; i < selection.length; i++) {
      // Vars needed for each calculation.
      const currentElement = selection[i];
      const determinedFrame = determineParentFrame(currentElement);
      const frameside = determineFrameSide(currentElement, <FrameNode>determinedFrame);

      if (AnnotationElements.parentFrames.find((x) => x.frame === determinedFrame) === undefined) {
        // If parentframe isn't yet added to the parentframes array.
        const startPointAnnotationsLeft = determinedFrame.x - 350;
        const startPointannotationsRight = determinedFrame.x + determinedFrame.width + 30;
        const newFramesItem: frame = {
          frame: <FrameNode>determinedFrame,
          startpointLeft: startPointAnnotationsLeft,
          startpointRight: startPointannotationsRight,
          sourceNodesLeft: [],
          sourceNodesRight: [],
        };

        if (frameside === "left") {
          console.log("Current element ", currentElement, ".");
          const indexOfElement: number = newFramesItem.sourceNodesLeft.findIndex(
            (x) => x.id === currentElement.id,
          );
          console.log("Found index: ", indexOfElement, ".");
          if (indexOfElement === -1) {
            newFramesItem.sourceNodesLeft.push(currentElement);
          } else {
            newFramesItem.sourceNodesLeft[indexOfElement] == currentElement;
          }
        } else {
          console.log("Current element ", currentElement, ".");
          const indexOfElement: number = newFramesItem.sourceNodesRight.findIndex(
            (x) => x.id === currentElement.id,
          );
          console.log("Found index: ", indexOfElement, ".");
          if (indexOfElement === -1) {
            newFramesItem.sourceNodesRight.push(currentElement);
          } else {
            newFramesItem.sourceNodesRight[indexOfElement] == currentElement;
          }
        }
        AnnotationElements.parentFrames.push(newFramesItem);
      } else {
        // If parentframe is already added to the array.
        const parentframe = AnnotationElements.parentFrames.find(
          (x) => x.frame === determinedFrame,
        );

        if (parentframe !== undefined) {
          // Determine left or right of parent frame, add to according array of the object.
          if (frameside === "left") {
            const indexOfElement: number = parentframe.sourceNodesLeft.findIndex(
              (x) => x.id === currentElement.id,
            );
            console.log("Found index: ", indexOfElement, ".");
            if (indexOfElement === -1) {
              parentframe.sourceNodesLeft.push(currentElement);
            } else {
              parentframe.sourceNodesLeft[indexOfElement] == currentElement;
            }
          } else {
            const indexOfElement: number = parentframe.sourceNodesRight.findIndex(
              (x) => x.id === currentElement.id,
            );
            console.log("Found index: ", indexOfElement, ".");
            if (indexOfElement === -1) {
              parentframe.sourceNodesRight.push(currentElement);
            } else {
              parentframe.sourceNodesRight[indexOfElement] == currentElement;
            }
          }
        }
      }
    }
    console.log(AnnotationElements.parentFrames);
  } else {
    createFigmaError("Select something to create an annotation.", 5000, true);
  }
}

function drawConnector(side: string, annotation: SceneNode, destination: SceneNode) {
  if (destination.absoluteBoundingBox !== null) {
    const line = figma.createVector();
    line.strokeCap = "ARROW_LINES";
    line.strokes = [{ type: "SOLID", color: PropertizeConstants.figmaDarkBlue }];
    line.strokeWeight = 2;
    AnnotationElements.annotationLayer.appendChild(line);
    AnnotationElements.annotationLayer.clipsContent = false;
    // M = starting point.
    // L = end point.
    line.vectorPaths = [
      {
        windingRule: "EVENODD",
        data: `M ${side === "left" ? annotation.x + annotation.width : annotation.x} ${
          annotation.y + annotation.height / 2
        } L ${
          side === "left"
            ? destination.absoluteBoundingBox.x
            : destination.absoluteBoundingBox.x + destination.absoluteBoundingBox.width
        } ${destination.absoluteBoundingBox.y + destination.absoluteBoundingBox.height / 2}`,
      },
    ];
    return line;
  }
}

function determineOverlap(
  i: number,
  currentAnnotation: SceneNode,
  currentSourceNode: SceneNode,
  lastAddedAnnotationYvalue: number,
) {
  let y;
  // If the value is the first element or the absolute position of the last annotation is.
  // Lower than the y coordinate of the source node than look at last annotationY to draw the annotation.
  i === 0 ||
  Math.abs(
    lastAddedAnnotationYvalue +
      currentAnnotation.height -
      currentSourceNode.absoluteTransform[1][2],
  ) < currentSourceNode.absoluteTransform[1][2]
    ? (y = currentSourceNode.absoluteTransform[1][2])
    : (y = lastAddedAnnotationYvalue + currentAnnotation.height + 5);

  return y;
}

function drawAnnotations(
  side: string,
  startPoint: number,
  sourceNodes: Array<SceneNode>,
  inputValues: AnnotationInput,
) {
  AnnotationElements.annotationLayer.x = 0;
  AnnotationElements.annotationLayer.y = 0;
  // Looping over given annotations.
  let lastAddedAnnotationY: number = sourceNodes[0].absoluteTransform[1][2];
  for (let i = 0; i < sourceNodes.length; i++) {
    const annotation = createAnnotation(inputValues);

    if (sourceNodes[i].visible === true) {
      annotation.x = startPoint;
      annotation.y = determineOverlap(i, annotation, sourceNodes[i], lastAddedAnnotationY);
      lastAddedAnnotationY = annotation.y;
    }

    AnnotationElements.annotationLayer.appendChild(annotation);
    const line = drawConnector(side, annotation, sourceNodes[i]);

    // Added for being able to update when sourcenode changes.
    if (line !== undefined) {
      linkAnnotationToSourceNodes.push({
        annotation: annotation,
        sourceNode: sourceNodes[i],
        vector: line,
      });
    }
  }
}

// Creating the annotation layer.
function createLayer() {
  // Finding older version of annotationlayer and deleting it => prevents multiple annotationlayers.
  const previous = figma.currentPage.findOne((n) => n.name === PropertizeConstants.layerName);
  previous?.remove();
  AnnotationElements.annotationLayer = figma.createFrame();
  AnnotationElements.annotationLayer.name = PropertizeConstants.layerName;
  // Making layer see-through aka deleting the fills.
  AnnotationElements.annotationLayer.fills = [];
  // Make layer lockable e.g. not dragged by accident.
  AnnotationElements.annotationLayer.locked = true;
}

function handleAnnotationRedraws(event: DocumentChangeEvent) {
  if (
    AnnotationElements.parentFrames.length > 0 &&
    AnnotationElements.annotationLayer.visible === true
  ) {
    //get data of changed nodes
    const changedNodeData = event.documentChanges;
    const listOfChangedAnnotationSourceNodes = [];
    for (let i = 0; i < changedNodeData.length; i++) {
      const changedNode = changedNodeData[i];

      //make searchable = if found in here => changedNode is a sourcenode of an annotation
      const SearchMap = JSON.stringify(AnnotationElements.parentFrames);
      const includesChangedNode = SearchMap.match(changedNode.id);

      if (includesChangedNode) {
        //gives weird error on property "node" => does not exist: it does.
        listOfChangedAnnotationSourceNodes.push(changedNode.node);
      }
    }

    console.log("changedNodes", listOfChangedAnnotationSourceNodes);

    //when changed nodes are found: redraw them
    listOfChangedAnnotationSourceNodes.forEach((changedNode) => {
      const parentFrame = determineParentFrame(changedNode);
      const frameside = determineFrameSide(changedNode, <FrameNode>parentFrame);
      //find linkedAnnotation
      const linkedAnnotation = linkAnnotationToSourceNodes.find(
        (item) => item.sourceNode.id === changedNode.id,
      );

      //find old vector connector and delete + update linkAnnotationToSourceNodes with the new vector for that annotation
      if (linkedAnnotation) {
        figma.currentPage.findOne((n) => n.id === linkedAnnotation.vector?.id)?.remove();
        const connector = drawConnector(
          frameside,
          <SceneNode>linkedAnnotation.annotation.absoluteBoundingBox,
          <SceneNode>changedNode,
        );
        if (connector !== undefined) {
          linkedAnnotation.vector = connector;
        }
      }
    });
  }
}

export function changeLayerVisibility(state: boolean) {
  if (AnnotationElements.annotationLayer) {
    AnnotationElements.annotationLayer.visible = state;
  }
}

export function initAnnotations(inputValues: AnnotationInput) {
  createLayer();
  makeFramesArray();

  if (AnnotationElements.parentFrames !== null) {
    for (let i = 0; i < AnnotationElements.parentFrames.length; i++) {
      const currentFrame = AnnotationElements.parentFrames[i];
      if (currentFrame.sourceNodesLeft.length > 0) {
        drawAnnotations(
          "left",
          currentFrame.startpointLeft,
          currentFrame.sourceNodesLeft,
          inputValues,
        );
      }
      if (currentFrame.sourceNodesRight.length > 0) {
        drawAnnotations(
          "right",
          currentFrame.startpointRight,
          currentFrame.sourceNodesRight,
          inputValues,
        );
      }
    }
  }

  //listen to updates after first initial drawing of the annotations
  figma.on("documentchange", (event: DocumentChangeEvent) => handleAnnotationRedraws(event));
}