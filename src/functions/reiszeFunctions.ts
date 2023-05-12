import { PropertizeConstants } from "../classes/propertizeConstants";

export function resizeByTab(tab: string, connection: boolean) {
  switch (tab) {
    case PropertizeConstants.connectTab:
      resizeByConnection(connection);
      break;
    case PropertizeConstants.settingsTab:
      figma.ui.resize(345, 355);
      break;
    case PropertizeConstants.usageTab:
      figma.ui.resize(345, 590);
      break;
    default:
      break;
  }
}

export function resizeByConnection(connection: boolean) {
  if (connection) {
    figma.ui.resize(345, 250);
  } else {
    figma.ui.resize(345, 250);
  }
}
