import { PropertizeConstants } from "../classes/propertizeConstants";

let height: number = PropertizeConstants.heightConnect;

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
    figma.ui.resize(345, 310);
  } else {
    figma.ui.resize(345, height);
  }
}

export function resizeByFilter(count: number) {
  count == 0 ? (height = PropertizeConstants.heightConnect) : (height = PropertizeConstants.heightConnect + count * PropertizeConstants.filterHeight);
}

export function resizeByRemoveFilter(count: number) {
  count == 0 ? (height = PropertizeConstants.heightConnect) : (height = PropertizeConstants.heightConnect + count * PropertizeConstants.filterHeight);
  figma.ui.resize(345, height);
}
export function resizeByShowMore(tab: string, isShowMore: boolean) {
  switch (tab) {
    case PropertizeConstants.connectTab:
      figma.ui.resize(345, isShowMore ? 350 : 310);
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
