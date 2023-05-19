import { AnnotationElements } from "../classes/annotationElements";
import { annotationLinkItem } from "../interfaces/annotationLinkItem";
import { linkAnnotationToSourceNodes, updateMultiUserVars } from "./annotationFunctions";
import { frame } from "../interfaces/frame";

function updateData(links: string, AnnotationElements: string) {
  const morphedLinks = JSON.parse(links) as Array<annotationLinkItem>;
  const morphedAnnotationElements = JSON.parse(AnnotationElements) as Array<frame>;
  updateMultiUserVars(morphedLinks, morphedAnnotationElements);
}

function handleChanges(event: DocumentChangeEvent) {
  const rootPluginDataChange = event.documentChanges.find(
    (change) =>
      change.node.id === figma.root.id && change.type === "PROPERTY_CHANGE" && change.properties.includes("pluginData") && change.origin === "LOCAL",
  );
  if (rootPluginDataChange) {
    const pluginLinksData = figma.root.getPluginData("MP_linkAnnotationToSourceNodes");
    const pluginAnnotationElements = figma.root.getPluginData("MP_AnnotationElements");
    updateData(pluginLinksData, pluginAnnotationElements);
  }
}

export default function multiUserManager(event: DocumentChangeEvent) {
  console.log("Updating MP data");
  handleChanges(event);
}
