import { AnnotationElements } from "../classes/annotationElements";
import { annotationLinkItem } from "../interfaces/annotationLinkItem";
import { linkAnnotationToSourceNodes } from "./annotationFunctions";

function updateData(links: string, AnnotationElements: string) {
  links = JSON.parse(links);
  AnnotationElements = JSON.parse(AnnotationElements);
  console.log("UPDATED ANNOTATIONELEMENTS:", links, "\n", "old version:", linkAnnotationToSourceNodes as Array<annotationLinkItem>);
  console.log("UPDATED LINKS:", AnnotationElements, "\n", "old version:", AnnotationElements as AnnotationElements);
}

function handleChanges() {
  figma.on("documentchange", (event) => {
    const rootPluginDataChange = event.documentChanges.find(
      (change) => change.node.id === figma.root.id && change.type === "PROPERTY_CHANGE" && change.properties.includes("pluginData"),
    );
    if (rootPluginDataChange) {
      const pluginLinksData = figma.root.getPluginData("MP_linkAnnotationToSourceNodes");
      const pluginAnnotationElements = figma.root.getPluginData("MP_AnnotationElements");
      updateData(pluginLinksData, pluginAnnotationElements);
    }
  });
}

export default function multiUserManager() {
  handleChanges();
}
