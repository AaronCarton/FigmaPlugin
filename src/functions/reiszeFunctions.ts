import { PropertizeConstants } from "../classes/propertizeConstants";

let height: number = 296;

export function resizeByTab(tab: string, connection: boolean) {
  switch (tab) {
    case PropertizeConstants.connectTab:
      resizeByConnection(connection);
      break;
    case PropertizeConstants.settingsTab:
      figma.ui.resize(345, 355);
      break;
    case PropertizeConstants.filterTab:
      figma.ui.resize(345, 261);
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
    figma.ui.resize(345, height);
  } else {
    figma.ui.resize(345, height);
  }
}

export function resizeByFilter(count: number) {
  if (count == 0) {
    height = 296;
  } else {
    height = 296 + count * 23;
  }
}

export function resizeByRemoveFilter(count: number) {
  if (count == 0) {
    height = 296;
  } else {
    height = 296 + count * 23;
  }
  figma.ui.resize(345, height);
}
