import { frame } from "../interfaces/frame";
import { AnnotationElements } from "../classes/annotationElements";
import { PropertizeConstants } from "../classes/propertizeConstants";
import { AnnotationInput } from "../interfaces/annotationInput";
import { annotationLinkItem } from "../interfaces/annotationLinkItem";
import Annotation from "../interfaces/interface.annotation";
import EventHub from "../services/events/EventHub";
import { Events } from "../services/events/Events";
import multiUserManager, { addCurrentUser } from "./multiUserManager";

export let linkAnnotationToSourceNodes: Array<annotationLinkItem> = [];
export let lastSelectedNode: string = "";

let highlightedAnnotationLinkItem: annotationLinkItem | undefined = undefined;
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
  if (parentFrame.absoluteTransform === undefined) {
    const found = <FrameNode>figma.currentPage.findOne((x) => x.id === parentFrame.id);
    found !== null ? (parentFrame = found) : console.log("no parent found");
    console.log("DetermineFrameSide parent was undefined, now found in figma", found);
  }
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
  let selection: Array<SceneNode> = [];

  if (initData !== null) {
    initData.forEach((element: Annotation) => {
      const foundElement = figma.currentPage.findOne((x) => x.id === element.nodeId);
      foundElement !== null ? selection.push(foundElement) : console.warn("MakeFramesArray error creating array from initData");
    });
  } else {
    selection = <Array<SceneNode>>figma.currentPage.selection;
  }

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
            if (indexOfElement === -1) {
              parentframe.sourceNodesLeft.push(currentElement);
            } else {
              parentframe.sourceNodesLeft[indexOfElement] == currentElement;
            }
          } else {
            const indexOfElement: number = parentframe.sourceNodesRight.findIndex((x) => x.id === currentElement.id);
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
        data: `M ${annotation.x <= destination.absoluteBoundingBox?.x ? annotation.x + annotation.width + 5 : annotation.x - 5} ${
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
    let currentItem = sourceNodes[i];
    // Test for redrawing, 0,0 (x,y) bug
    if (currentItem.absoluteTransform === undefined) {
      const foundSourceNode = figma.currentPage.findOne((x) => x.id === currentItem.id);
      foundSourceNode !== null ? (sourceNodes[i] = foundSourceNode) : console.log("not found in figma");
      console.log("found Source Node for update", foundSourceNode);
    }

    if (currentItem.absoluteTransform === undefined) {
      const foundCurrentItemInFigma = figma.currentPage.findOne((x) => x.id === currentItem.id);
      foundCurrentItemInFigma !== null ? (currentItem = foundCurrentItemInFigma) : console.log("error while drawing, foundInFigma === null");
    }
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

    // Had to initialise annotation before using the variable (null), this check is to prevent the annotation from staying null and getting rid of all the warnings.
    if (annotation === null) {
      return null;
    }

    annotation.x = startPoint;
    if (sourceNodes[i].absoluteTransform === undefined) {
      const found = figma.currentPage.findOne((x) => x.id === sourceNodes[i].id);
      if (found !== null) {
        sourceNodes[i] = found;
      }
    }
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

function highlight(found: annotationLinkItem) {
  // Reset previous
  resetHighlightedAnnotation();
  // Set new highlighted annotation and vector
  if (found) {
    found.vector.strokes = [{ type: "SOLID", color: PropertizeConstants.figmaBlack }];
    found.annotation.strokes = [{ type: "SOLID", color: PropertizeConstants.figmaBlack }];
    found.annotation.dashPattern = [0, 0];
    highlightedAnnotationLinkItem = found;
  }
}

function resetHighlightedAnnotation() {
  if (highlightedAnnotationLinkItem !== undefined && highlightedAnnotationLinkItem.annotation.removed === false) {
    //reset annotation
    highlightedAnnotationLinkItem.annotation.strokes = [{ type: "SOLID", color: PropertizeConstants.figmaDarkBlue }];
    highlightedAnnotationLinkItem.annotation.dashPattern = [10, 5];
    //reset vector
    highlightedAnnotationLinkItem.vector.strokes = [{ type: "SOLID", color: PropertizeConstants.figmaDarkBlue }];
  }
  highlightedAnnotationLinkItem = undefined;
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

      if (includesChangedNode && changedNode.type === "PROPERTY_CHANGE" && changedNode.node.removed === false) {
        //Gives weird error on property "node" => does not exist: it does.
        listOfChangedAnnotationSourceNodes.push(changedNode.node);
      }
    }

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
        highlight(linkedAnnotation);
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
  const annotationLayerFound = figma.currentPage.findOne((element) => element.name === "Annotations");

  // Adding current user to the list of users.
  if (figma.currentUser) {
    addCurrentUser(figma.currentUser);
    console.log("currentUsers in init", figma.root.getPluginData("MP_currentUsers"));
  }

  if (!annotationLayerFound) {
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
  } else {
    // If layer is found => set annotationLayer to found annotation layer.
    AnnotationElements.annotationLayer = annotationLayerFound as FrameNode;
  }

  // If layer is not found (you are first person in document that launches plugin), you should update the pluginData with the most recent values.
  if (linkAnnotationToSourceNodes && AnnotationElements.parentFrames && !annotationLayerFound) {
    console.log("setting plugin data", linkAnnotationToSourceNodes, AnnotationElements.parentFrames);
    figma.root.setPluginData("MP_linkAnnotationToSourceNodes", JSON.stringify(linkAnnotationToSourceNodes));
    figma.root.setPluginData("MP_AnnotationElements", JSON.stringify(AnnotationElements.parentFrames));
  }

  // If you are not the first person to launch the plugin, you should get the parentframes and link array from the pluginData.
  if (annotationLayerFound) {
    AnnotationElements.parentFrames = JSON.parse(figma.root.getPluginData("MP_AnnotationElements"));
    linkAnnotationToSourceNodes = JSON.parse(figma.root.getPluginData("MP_linkAnnotationToSourceNodes"));
    console.log("init not first connect: ", AnnotationElements.parentFrames, linkAnnotationToSourceNodes);
  }
  // Listen to updates after first initial drawing of the annotations.
  figma.on("documentchange", (event: DocumentChangeEvent) => handleConnectorRedraws(event));
  figma.on("documentchange", (event: DocumentChangeEvent) => multiUserManager(event));
}

export function updateAnnotations(selection: Array<SceneNode>, inputValues: AnnotationInput) {
  for (let i = 0; i < selection.length; i++) {
    const currentItem: SceneNode = selection[i];
    const found: annotationLinkItem | undefined = linkAnnotationToSourceNodes.find((x) => x.sourceNode.id === currentItem.id);
    const foundLinkedAnnoCoords = figma.currentPage.findOne((x) => x.id === found?.annotation.id)?.absoluteBoundingBox;
    console.log("found for update", found);
    console.log("found linked anno for update", foundLinkedAnnoCoords);
    if (found !== undefined) {
      // Item already has an annotation.
      found.data = inputValues;
      console.log("found data assigned", found.data);
      // const coords =
      //   found.annotation.absoluteBoundingBox && found.annotation.absoluteBoundingBox.x === 0 && foundLinkedAnnoCoords !== null
      //     ? foundLinkedAnnoCoords
      //     : found.annotation.absoluteBoundingBox;
      const coords = foundLinkedAnnoCoords;
      console.log("coords", coords);
      figma.currentPage.findOne((x) => x.id === found.annotation.id)?.remove();
      found.annotation = createAnnotation(inputValues);
      AnnotationElements.annotationLayer.appendChild(found.annotation);
      if (coords !== null && coords !== undefined) {
        found.annotation.x = coords.x;
        found.annotation.y = coords.y;
      }
      // If the highlighted item is updated = update the global var aswell to keep track of changing id of the vector and annotation
      if (highlightedAnnotationLinkItem !== undefined && found.sourceNode.id === highlightedAnnotationLinkItem.sourceNode.id) {
        highlightedAnnotationLinkItem = found;
        highlight(found);
      }
      linkAnnotationToSourceNodes[linkAnnotationToSourceNodes.indexOf(found)] = found;
    } else {
      // Item doesn't have an annotation yet.
      console.log("item that needs anno", currentItem);
      const parent = determineParentFrame(currentItem);
      const foundParent = AnnotationElements.parentFrames.find((x) => x.frame.id === parent.id);
      console.log("foundParent for drawing new anno", foundParent);
      if (foundParent !== undefined) {
        // Parent frame of new item found in parentFrames array.
        const side = determineFrameSide(currentItem, foundParent.frame);
        const startPoint = side === PropertizeConstants.sideLeft ? foundParent.startpointLeft : foundParent.startpointRight;
        const sourceNodes = side === PropertizeConstants.sideLeft ? foundParent.sourceNodesLeft : foundParent.sourceNodesRight;
        // Push item to corresponding array.
        sourceNodes.push(currentItem);
        // Redraw that updated array.
        console.log("sourceNodes for creating new anno", sourceNodes);
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
  }
  // After update logic is done, update the MP data.
  figma.root.setPluginData("MP_linkAnnotationToSourceNodes", JSON.stringify(linkAnnotationToSourceNodes));
  figma.root.setPluginData("MP_AnnotationElements", JSON.stringify(AnnotationElements.parentFrames));
}

export function sendDataToFrontend() {
  if (figma.currentPage.selection[0] !== undefined) {
    lastSelectedNode = figma.currentPage.selection[0].id;
    const found = linkAnnotationToSourceNodes.find((x) => x.sourceNode.id === figma.currentPage.selection[0].id);
    console.log("curr selection", found);
    highlightedAnnotationLinkItem === undefined
      ? ((highlightedAnnotationLinkItem = found), highlight(<annotationLinkItem>found))
      : console.log("Highlight is not undefined");

    if (found !== undefined) {
      if (found !== highlightedAnnotationLinkItem) {
        console.log("Found new item to highlight: ", found);
        highlight(found);
      }
      EventHub.getInstance().sendCustomEvent(Events.UI_UPDATE_FIELDS, found.data, true);
    }
    if (found === undefined) {
      if (figma.currentPage.selection[0].type === "TEXT") {
        EventHub.getInstance().sendCustomEvent(Events.SET_SAMPLE_VALUE_FROM_FIGMANODE, figma.currentPage.selection[0].characters);
      } else {
        EventHub.getInstance().sendCustomEvent(Events.UI_CLEAR_FIELDS, null, true);
        resetHighlightedAnnotation();
      }
    }
  } else {
    EventHub.getInstance().sendCustomEvent(Events.UI_CLEAR_FIELDS, null, true);
    resetHighlightedAnnotation();
  }
}

export function archiveAnnotation(annotation: Annotation) {
  const foundLinkToArchive = linkAnnotationToSourceNodes.find((x) => x.sourceNode.id === annotation.nodeId);
  console.log("found for deletion", foundLinkToArchive);
  // Remove annotation from array
  if (foundLinkToArchive) {
    // Deletes found element from the parentframe array
    AnnotationElements.parentFrames.forEach((currentParent) => {
      const leftFound = currentParent.sourceNodesLeft.find((x) => x.id === foundLinkToArchive.sourceNode.id);
      if (leftFound === undefined) {
        const rightFound = currentParent.sourceNodesRight.find((x) => x.id === foundLinkToArchive.sourceNode.id);
        if (rightFound === undefined) {
          return;
        } else {
          const deleted = currentParent.sourceNodesRight.splice(currentParent.sourceNodesRight.indexOf(rightFound));
          return;
        }
      } else {
        const deleted = currentParent.sourceNodesLeft.splice(currentParent.sourceNodesLeft.indexOf(leftFound));
        return;
      }
    });
    // Update new parentFrames array for MP.
    figma.root.setPluginData("MP_AnnotationElements", JSON.stringify(AnnotationElements.parentFrames));
    console.log("not found error vector", foundLinkToArchive.vector);
    try {
      foundLinkToArchive.vector.remove();
    } catch (error) {
      const foundInFigma = figma.root.findOne((x) => x.id === foundLinkToArchive.vector.id);
      foundInFigma !== null ? foundInFigma.remove() : console.log("found was null when deleting vector");
    }
    try {
      foundLinkToArchive.annotation.remove();
    } catch (error) {
      const foundInFigma = figma.root.findOne((x) => x.id === foundLinkToArchive.annotation.id);
      foundInFigma !== null ? foundInFigma.remove() : console.log("found was null when deleting vector");
    }
    linkAnnotationToSourceNodes.splice(linkAnnotationToSourceNodes.indexOf(foundLinkToArchive), 1);
    // Update new links for MP.
    figma.root.setPluginData("MP_linkAnnotationToSourceNodes", JSON.stringify(linkAnnotationToSourceNodes));
    EventHub.getInstance().sendCustomEvent(Events.UI_CLEAR_FIELDS, null, true);
  } else {
    EventHub.getInstance().sendCustomEvent(Events.FIGMA_ERROR, "Couldn't remove annotation.");
  }
}

export function updateMultiUserVars(links: Array<annotationLinkItem>, parentFrames: Array<frame>) {
  if (linkAnnotationToSourceNodes !== links) {
    linkAnnotationToSourceNodes = links;
  }
  if (AnnotationElements.parentFrames !== parentFrames) {
    AnnotationElements.parentFrames = parentFrames;
  }
  console.log("Given MP data in update func", links, parentFrames);
  console.log("updated local data", linkAnnotationToSourceNodes, AnnotationElements.parentFrames);
}
