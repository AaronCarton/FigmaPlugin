import { annotationLinkItem } from "../interfaces/annotationLinkItem";
import { updateMultiUserVars } from "./annotationFunctions";
import { frame } from "../interfaces/frame";
import { PropertizeConstants } from "../classes/propertizeConstants";

export function addCurrentUser(user: User) {
  let currentUsers: string | Array<string> = figma.root.getPluginData(PropertizeConstants.MP_currentUsers);
  if (currentUsers !== "") {
    // If not first user, add currentUser id to array.
    currentUsers = JSON.parse(currentUsers) as Array<string>;
    currentUsers.push(user.id as string);
    figma.root.setPluginData(PropertizeConstants.MP_currentUsers, JSON.stringify(currentUsers));
  } else {
    // If first user, set currentUsers to array with only user id.
    figma.root.setPluginData(PropertizeConstants.MP_currentUsers, JSON.stringify([user.id]));
  }
}

export function removeCurrentUser() {
  const currentUsers = JSON.parse(figma.root.getPluginData(PropertizeConstants.MP_currentUsers)) as Array<string>;
  if (figma.currentUser !== null) {
    const userIndex = currentUsers.indexOf(figma.currentUser.id as string);
    currentUsers.splice(userIndex, 1);
  }
  figma.root.setPluginData(PropertizeConstants.MP_currentUsers, JSON.stringify(currentUsers));
}

export function isLastUser() {
  const currentUsers = JSON.parse(figma.root.getPluginData(PropertizeConstants.MP_currentUsers)) as Array<string>;
  if (currentUsers.length === 1) {
    return true;
  } else {
    return false;
  }
}

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
    const pluginLinksData = figma.root.getPluginData(PropertizeConstants.MP_linkAnnotationToSourceNodes);
    const pluginAnnotationElements = figma.root.getPluginData(PropertizeConstants.MP_AnnotationElements);
    updateData(pluginLinksData, pluginAnnotationElements);
  }
}

export default function multiUserManager(event: DocumentChangeEvent) {
  handleChanges(event);
}