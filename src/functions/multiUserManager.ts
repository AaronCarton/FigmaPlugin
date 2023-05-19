import { AnnotationElements } from "../classes/annotationElements";
import { annotationLinkItem } from "../interfaces/annotationLinkItem";
import { linkAnnotationToSourceNodes, updateMultiUserVars } from "./annotationFunctions";
import { frame } from "../interfaces/frame";

// function createMPData(links: Array<annotationLinkItem>, AnnotationElements: AnnotationElements) {
//   const linksToSend =
// }

function updateData(links: string, AnnotationElements: string) {
  const morphedLinks = JSON.parse(links) as Array<annotationLinkItem>;
  const morphedAnnotationElements = JSON.parse(AnnotationElements) as Array<frame>;
  updateMultiUserVars(morphedLinks, morphedAnnotationElements);
}

function handleChanges(event: DocumentChangeEvent) {
  const rootPluginDataChange = event.documentChanges.find(
    (change) => change.node.id === figma.root.id && change.type === "PROPERTY_CHANGE" && change.properties.includes("pluginData"),
  );
  if (rootPluginDataChange && rootPluginDataChange.origin === "REMOTE") {
    // If changes happened remotely, update the local data.
    const pluginLinksData = figma.root.getPluginData("MP_linkAnnotationToSourceNodes");
    const pluginAnnotationElements = figma.root.getPluginData("MP_AnnotationElements");
    console.log("pluginLinks", pluginLinksData);
    console.log("pluginAnnotationElements", pluginAnnotationElements);
    updateData(pluginLinksData, pluginAnnotationElements);
  } 
}

export default function multiUserManager(event: DocumentChangeEvent) {
  console.log("Updating MP data");
  handleChanges(event);
}
