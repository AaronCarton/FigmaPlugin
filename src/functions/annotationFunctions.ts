import { frame } from "../interfaces/frame";
import { AnnotationElements } from "../classes/annotationElements";
import { PropertizeConstants } from "../classes/propertizeConstants";
import { AnnotationInput } from "../interfaces/annotationInput";
import { annotationLinkItem } from "../interfaces/annotationLinkItem";
import { MessageTitle } from "../classes/messageTitles";
import Annotation from "../interfaces/interface.annotation";
import { createFigmaError } from "./createError";

export const linkAnnotationToSourceNodes: Array<annotationLinkItem> = [];
let layerState = true;

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

  const titles = {
    "Data Source": inputValues.dataSource,
    "Entity": inputValues.entity,
    "Attribute": inputValues.attribute,
    "Data Type": inputValues.dataType,
    "Sample Value": inputValues.value,
  };

  Object.entries(titles).forEach(([title, value], index) => {
    const titlesNode = figma.createText();
    titlesNode.name = title;
    titlesNode.characters = title;
    titlesNode.fontSize = 11;
    titlesNode.x = 15;
    titlesNode.y = 22 * index + 15;
    titlesNode.fontName = { family: "Inter", style: "Semi Bold" };
    titlesNode.fills = [{ type: "SOLID", color: PropertizeConstants.figmaBlack }];
    frame.appendChild(titlesNode);
    const valuesNode = figma.createText();
    valuesNode.name = value;
    valuesNode.characters = value;
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
    return PropertizeConstants.sideLeft;
  } else {
    return PropertizeConstants.sideRight;
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

function makeFramesArray(initData: Array<Annotation> | null) {
  console.log("Making frame array...");
  let selection: Array<SceneNode> = [];

  if (initData !== null) {
    console.log("initData", initData);
    initData.forEach((element: Annotation) => {
      const foundElement = figma.currentPage.findOne((x) => x.id === element.nodeId);
      foundElement !== null ? selection.push(foundElement) : console.warn("MakeFramesArray error creating array from initData");
    });
  } else {
    selection = <Array<SceneNode>>figma.currentPage.selection;
  }

  if (selection.length > 0) {
    sortNodesAccordingToYCoords(selection);
    console.log("selection", selection);

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

        if (frameside === PropertizeConstants.sideLeft) {
          const indexOfElement: number = newFramesItem.sourceNodesLeft.findIndex((x) => x.id === currentElement.id);
          if (indexOfElement === -1) {
            newFramesItem.sourceNodesLeft.push(currentElement);
          } else {
            newFramesItem.sourceNodesLeft[indexOfElement] == currentElement;
          }
        } else {
          const indexOfElement: number = newFramesItem.sourceNodesRight.findIndex((x) => x.id === currentElement.id);
          if (indexOfElement === -1) {
            newFramesItem.sourceNodesRight.push(currentElement);
          } else {
            newFramesItem.sourceNodesRight[indexOfElement] == currentElement;
          }
        }

        AnnotationElements.parentFrames.push(newFramesItem);
      } else {
        // If parentframe is already added to the array.
        const parentframe = AnnotationElements.parentFrames.find((x) => x.frame === determinedFrame);

        if (parentframe !== undefined) {
          // Determine left or right of parent frame, add to according array of the object.
          if (frameside === PropertizeConstants.sideLeft) {
            const indexOfElement: number = parentframe.sourceNodesLeft.findIndex((x) => x.id === currentElement.id);
            console.log("Found index: ", indexOfElement, ".");
            if (indexOfElement === -1) {
              parentframe.sourceNodesLeft.push(currentElement);
            } else {
              parentframe.sourceNodesLeft[indexOfElement] == currentElement;
            }
          } else {
            const indexOfElement: number = parentframe.sourceNodesRight.findIndex((x) => x.id === currentElement.id);
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
    return AnnotationElements.parentFrames;
  }
}

function drawConnector(annotation: SceneNode, destination: SceneNode) {
  if (destination.absoluteBoundingBox !== null && annotation.absoluteBoundingBox !== null) {
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
        data: `M ${annotation.x <= destination.absoluteBoundingBox.x ? annotation.x + annotation.width + 5 : annotation.x - 5} ${
          annotation.y + annotation.height / 2
        } L ${
          annotation.x <= destination.absoluteBoundingBox.x
            ? destination.absoluteBoundingBox.x - 5
            : destination.absoluteBoundingBox.x + destination.absoluteBoundingBox.width + 5
        } ${destination.absoluteBoundingBox.y + destination.absoluteBoundingBox.height / 2}`,
      },
    ];

    return line;
  }
}

function determineOverlap(i: number, currentAnnotation: SceneNode, currentSourceNode: SceneNode, lastAddedAnnotationYvalue: number) {
  let y;
  // If the value is the first element or the absolute position of the last annotation is.
  // Lower than the y coordinate of the source node than look at last annotationY to draw the annotation.
  i === 0 ||
  Math.abs(lastAddedAnnotationYvalue + currentAnnotation.height - currentSourceNode.absoluteTransform[1][2]) <
    currentSourceNode.absoluteTransform[1][2]
    ? (y = currentSourceNode.absoluteTransform[1][2])
    : (y = lastAddedAnnotationYvalue + currentAnnotation.height + 5);

  return y;
}

function drawAnnotations(
  startPoint: number,
  sourceNodes: Array<SceneNode>,
  inputValues: AnnotationInput | Array<{ id: string; AnnotationInput: AnnotationInput }>,
) {
  AnnotationElements.annotationLayer.x = 0;
  AnnotationElements.annotationLayer.y = 0;
  // Looping over given annotations.
  let lastAddedAnnotationY: number = sourceNodes[0].absoluteTransform[1][2];
  for (let i = 0; i < sourceNodes.length; i++) {
    const found = linkAnnotationToSourceNodes.find((x) => x.sourceNode.id == sourceNodes[i].id);
    let annotation: FrameNode | null = null;

    // Remove old drawn vector an annotation of the sourcenode (only if the sourcenode already had an annotation).
    if (found !== undefined) {
      figma.currentPage.findOne((x) => x.id === found?.annotation.id)?.remove();
      figma.currentPage.findOne((x) => x.id === found?.vector.id)?.remove();
    }

    // If links of the sourcenode doesn't exist.
    if (found === undefined) {
      // Check if inputValues is an array.
      if (Array.isArray(inputValues)) {
        // Get annotationInput values from element with same sourceNode Id.
        const findData = inputValues.find((x) => x.id === sourceNodes[i].id)?.AnnotationInput;
        if (findData !== undefined) {
          annotation = createAnnotation(findData);
        }
      } else {
        // Not an array (a.k.a being called from updateAnnotation function instead of initAnnotations).
        annotation = createAnnotation(inputValues);
      }
    } else {
      // If links of the sourcenode already exist.
      annotation = createAnnotation(found.data);
    }

    //Had to initialise annotation before using the variable (null), this check is to prevent the annotation from staying null and getting rid of all the warnings.
    if (annotation === null) {
      return null;
    }

    annotation.x = startPoint;
    annotation.y = determineOverlap(i, annotation, sourceNodes[i], lastAddedAnnotationY);
    lastAddedAnnotationY = annotation.y;
    AnnotationElements.annotationLayer.appendChild(annotation);
    const line = drawConnector(annotation, sourceNodes[i]);

    // Updating the link of the drawn annotation and its elements
    if (found === undefined && line !== undefined) {
      if (Array.isArray(inputValues)) {
        const associatedInputValue = inputValues.find((x) => x.id === sourceNodes[i]?.id);
        // Creating a new link and pushing it to array.
        if (associatedInputValue !== undefined) {
          linkAnnotationToSourceNodes.push({
            annotation: annotation,
            sourceNode: sourceNodes[i],
            vector: line,
            // data: inputValues[i].AnnotationInput,
            data: associatedInputValue?.AnnotationInput,
          });
        }
      } else {
        // Creating a new link and pushing it to array.
        linkAnnotationToSourceNodes.push({
          annotation: annotation,
          sourceNode: sourceNodes[i],
          vector: line,
          data: inputValues,
        });
      }
    } else {
      if (found !== undefined && line !== undefined)
        // Updating existing link in the array.
        linkAnnotationToSourceNodes[linkAnnotationToSourceNodes.indexOf(found)] = {
          annotation: annotation,
          sourceNode: sourceNodes[i],
          vector: line,
          data: found.data,
        };
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
  AnnotationElements.annotationLayer.visible = layerState;
}

function handleConnectorRedraws(event: DocumentChangeEvent) {
  if (AnnotationElements.parentFrames.length > 0 && AnnotationElements.annotationLayer.visible === true) {
    //Get data of changed nodes.
    const changedNodeData = event.documentChanges;
    const listOfChangedAnnotationSourceNodes = [];
    for (let i = 0; i < changedNodeData.length; i++) {
      const changedNode = changedNodeData[i];

      //Make searchable = if found in here => changedNode is a sourcenode of an annotation
      const searchMap = JSON.stringify(AnnotationElements.parentFrames);
      const includesChangedNode = searchMap.match(changedNode.id);

      if (includesChangedNode) {
        //Gives weird error on property "node" => does not exist: it does.
        listOfChangedAnnotationSourceNodes.push(changedNode.node);
      }
    }

    console.log("changedNodes", listOfChangedAnnotationSourceNodes);

    // When changed nodes are found: redraw them.
    listOfChangedAnnotationSourceNodes.forEach((changedNode) => {
      //find linkedAnnotation
      const linkedAnnotation = linkAnnotationToSourceNodes.find((item) => item.sourceNode.id === changedNode.id);

      // Find old vector connector and delete + update linkAnnotationToSourceNodes with the new vector for that annotation.
      if (linkedAnnotation) {
        figma.currentPage.findOne((n) => n.id === linkedAnnotation.vector?.id)?.remove();
        const connector = drawConnector(<SceneNode>linkedAnnotation.annotation.absoluteBoundingBox, <SceneNode>changedNode);
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
  } else {
    layerState = state;
  }
}

export function initAnnotations(annotationData: Array<Annotation>) {
  console.log("initing");
  createLayer();
  makeFramesArray(annotationData);
  // Make inputValues array needed for drawing initial annotations.
  const inputValues: Array<{ id: string; AnnotationInput: AnnotationInput }> = [];
  for (let i = 0; i < annotationData.length; i++) {
    const element = annotationData[i];
    inputValues.push({
      id: element.nodeId,
      AnnotationInput: {
        dataSource: element.dataSource,
        entity: element.entity,
        attribute: element.attribute,
        dataType: element.dataType,
        value: element.value,
      },
    });
  }

  if (AnnotationElements.parentFrames !== null) {
    for (let i = 0; i < AnnotationElements.parentFrames.length; i++) {
      const currentFrame = AnnotationElements.parentFrames[i];
      if (currentFrame.sourceNodesLeft.length > 0) {
        drawAnnotations(currentFrame.startpointLeft, sortNodesAccordingToYCoords(currentFrame.sourceNodesLeft), inputValues);
      }
      if (currentFrame.sourceNodesRight.length > 0) {
        drawAnnotations(currentFrame.startpointRight, sortNodesAccordingToYCoords(currentFrame.sourceNodesRight), inputValues);
      }
    }
  }
  // Listen to updates after first initial drawing of the annotations.
  figma.on("documentchange", (event: DocumentChangeEvent) => handleConnectorRedraws(event));
}

export function updateAnnotations(selection: Array<SceneNode>, inputValues: AnnotationInput) {
  console.log("updating");
  for (let i = 0; i < selection.length; i++) {
    const currentItem: SceneNode = selection[i];
    const found: annotationLinkItem | undefined = linkAnnotationToSourceNodes.find((x) => x.sourceNode.id === currentItem.id);

    if (found !== undefined) {
      // Item already has an annotation.
      found.data = inputValues;
      const coords = found.annotation.absoluteBoundingBox;
      figma.currentPage.findOne((x) => x.id === found.annotation.id)?.remove();
      found.annotation = createAnnotation(inputValues);
      AnnotationElements.annotationLayer.appendChild(found.annotation);
      if (coords !== null) {
        found.annotation.x = coords.x;
        found.annotation.y = coords.y;
      }
      linkAnnotationToSourceNodes[linkAnnotationToSourceNodes.indexOf(found)] = found;
    } else {
      // Item doesn't have an annotation yet.
      const parent = determineParentFrame(currentItem);
      const foundParent = AnnotationElements.parentFrames.find((x) => x.frame.id === parent.id);

      if (foundParent !== undefined) {
        // Parent frame of new item found in parentFrames array.
        const side = determineFrameSide(currentItem, foundParent.frame);
        const startPoint = side === PropertizeConstants.sideLeft ? foundParent.startpointLeft : foundParent.startpointRight;
        const sourceNodes = side === PropertizeConstants.sideLeft ? foundParent.sourceNodesLeft : foundParent.sourceNodesRight;
        // Push item to corresponding array.
        sourceNodes.push(currentItem);
        // Redraw that updated array.
        drawAnnotations(startPoint, sortNodesAccordingToYCoords(sourceNodes), inputValues);
      } else {
        // Parent frame of new item is not yet added to parentFrames Array.
        console.log;
        //make data for new parentframe
        makeFramesArray(null);
        // If parent doesn't exist the newly added item will always be the last in the array.
        const newParentFrame = AnnotationElements.parentFrames[AnnotationElements.parentFrames.length - 1];

        if (newParentFrame !== undefined) {
          // Determine side of the annotation
          const side = determineFrameSide(currentItem, newParentFrame.frame);
          const startPoint = side === PropertizeConstants.sideLeft ? newParentFrame.startpointLeft : newParentFrame.startpointRight;
          const sourceNodes = side === PropertizeConstants.sideLeft ? newParentFrame.sourceNodesLeft : newParentFrame.sourceNodesRight;
          drawAnnotations(startPoint, sortNodesAccordingToYCoords(sourceNodes), inputValues);
        }
      }
    }
    console.log(linkAnnotationToSourceNodes);
  }
}

export function sendDataToFrontend() {
  if (figma.currentPage.selection[0] !== undefined) {
    const found = linkAnnotationToSourceNodes.find((x) => x.sourceNode.id === figma.currentPage.selection[0].id);
    console.log("FOUND", found);
    if (found !== undefined) {
      figma.ui.postMessage({
        type: MessageTitle.updateFields,
        payload: {
          values: found.data,
        },
      });
    }
    if (found === undefined) {
      figma.ui.postMessage({ type: MessageTitle.clearFields });
    }
  } else {
    figma.ui.postMessage({ type: MessageTitle.clearFields });
  }
}

export function deleteAnnotation() {
  const found = linkAnnotationToSourceNodes.find((x) => x.sourceNode.id === figma.currentPage.selection[0].id);
  if (found) {
    found.vector.remove();
    found.annotation.remove();
    figma.ui.postMessage({ type: MessageTitle.clearFields });
  } else {
    createFigmaError("Couldn't remove annotation.", 5000, true);
  }
}
