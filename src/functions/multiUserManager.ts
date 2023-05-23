import { annotationLinkItem } from "../interfaces/annotationLinkItem";
import { updateMultiUserVars } from "./annotationFunctions";
import { frame } from "../interfaces/frame";

export function addCurrentUser(user: User) {
  const currentUsers = figma.root.getPluginData("MP_currentUsers");
  console.log("currentUsers before adding", currentUsers);
  if (currentUsers.length !== 0) {
    // If not first user, add currentUser id to array.
    currentUsers.push(user.id as string);
    figma.root.setPluginData("MP_currentUsers", JSON.stringify(currentUsers));
    console.log("user added to currentUser array: ", currentUsers);
  } else {
    // If first user, set currentUsers to array with only user id.
    figma.root.setPluginData("MP_currentUsers", JSON.stringify([user.id]));
    console.log("made currentUser array", currentUsers);
  }
}

export function removeCurrentUser() {
  const currentUsers = JSON.parse(figma.root.getPluginData("MP_currentUsers")) as Array<string>;
  if (figma.currentUser !== null) {
    const userIndex = currentUsers.indexOf(figma.currentUser.id as string);
    currentUsers.splice(userIndex);
    console.log("deleted user ", figma.currentUser.id, " from user array: ", currentUsers);
  }
  figma.root.setPluginData("MP_currentUsers", JSON.stringify(currentUsers));
}

export function isLastUser() {
  const currentUsers = JSON.parse(figma.root.getPluginData("MP_currentUsers")) as Array<string>;
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
  console.log("updated MP data");
}
