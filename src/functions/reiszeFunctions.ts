import { PropertizeConstants } from "../classes/propertizeConstants";

export function resizeByTab(tab: string, connection: boolean) {
  switch (tab) {
    case PropertizeConstants.connectTab:
      resizeByConnection(connection);
      break;
    case PropertizeConstants.settingsTab:
      figma.ui.resize(PropertizeConstants.widthPlugin, PropertizeConstants.heightSettings);
      break;
    case PropertizeConstants.filterTab:
      figma.ui.resize(PropertizeConstants.widthPlugin, PropertizeConstants.heightFilter);
      break;
    case PropertizeConstants.usageTab:
      figma.ui.resize(PropertizeConstants.widthPlugin, PropertizeConstants.heightUsage);
      break;
    default:
      break;
  }
}

export function resizeByConnection(connection: boolean) {
  if (connection) {
    figma.ui.resize(PropertizeConstants.widthPlugin, PropertizeConstants.heightConnect);
  } else {
    figma.ui.resize(PropertizeConstants.widthPlugin, PropertizeConstants.heightConnect);
  }
}

export function resizeByShowMore(tab: string, isShowMore: boolean) {
  switch (tab) {
    case PropertizeConstants.connectTab:
      figma.ui.resize(PropertizeConstants.widthPlugin, isShowMore ? PropertizeConstants.heightConnect + 45 : PropertizeConstants.heightConnect);
      break;
    case PropertizeConstants.settingsTab:
      figma.ui.resize(PropertizeConstants.widthPlugin, PropertizeConstants.heightSettings);
      break;
    case PropertizeConstants.filterTab:
      figma.ui.resize(PropertizeConstants.widthPlugin, PropertizeConstants.heightFilter);
      break;
    case PropertizeConstants.usageTab:
      figma.ui.resize(PropertizeConstants.widthPlugin, PropertizeConstants.heightUsage);
      break;
    default:
      break;
  }
}
