import { annotationLinkItem } from "../interfaces/annotationLinkItem";
import { updateMultiUserVars } from "./annotationFunctions";
import { frame } from "../interfaces/frame";
import { PropertizeConstants } from "../classes/propertizeConstants";

export function addCurrentUser(user: User) {
  let currentUsers: string | Array<string> = figma.root.getPluginData(PropertizeConstants.MP_currentUsers);
  const isFirstUserValue = isFirstUser();
  if (!isFirstUserValue) {
    // If not first user, add currentUser id to array.
    currentUsers = JSON.parse(currentUsers) as Array<string>;
    if (!currentUsers.find((x) => x === (figma.currentUser?.id as string))) {
      currentUsers.push(user.id as string);
      console.log("user was already in array");
    }
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
    const deleted = currentUsers.splice(userIndex, 1);
    console.log("deleted", deleted);
  }
  figma.root.setPluginData(PropertizeConstants.MP_currentUsers, JSON.stringify(currentUsers));
}

export async function isLastUser() {
  if (figma.activeUsers.length === 1) {
    console.log("is only user in file");
    return true;
  }

  const currentUsers = (await JSON.parse(figma.root.getPluginData(PropertizeConstants.MP_currentUsers))) as Array<string>;
  if (currentUsers.length === 1) {
    console.log("is last user", currentUsers);
    return true;
  } else {
    console.log("is not last user", currentUsers);
    return false;
  }
}

export async function isFirstUser() {
  const currentUsers = figma.root.getPluginData(PropertizeConstants.MP_currentUsers);
  // If user is only user in file, he must be first running the plugin
  if (figma.activeUsers.length === 1) {
    console.log("is only user in file");
    return true;
  }

  if (currentUsers === "") {
    console.log("is first user", currentUsers);
    return true;
  }

  const currentUsersArray = (await JSON.parse(currentUsers)) as Array<string>;
  console.log("arr", currentUsersArray);
  if (currentUsersArray.find((x) => x === (figma.currentUser?.id as string)) !== undefined && currentUsersArray.length === 1) {
    console.log("found already and is only in array", currentUsersArray);
    return true;
  } else {
    console.log("is not first user", currentUsers);
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
