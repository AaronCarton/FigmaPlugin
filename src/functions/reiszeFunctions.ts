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
    figma.ui.resize(345, 310);
  } else {
    figma.ui.resize(345, 296);
  }
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
