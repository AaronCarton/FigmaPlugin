figma.showUI(__html__, { width: 345, height: 250 });

figma.ui.onmessage = (event) => {
  const eventType = event.type;
  const selectedTab = event.tab;
  const connectionState = event.connection;

  if (eventType == "changeTab") {
    if (selectedTab == "connect") {
      if (connectionState) {
        figma.ui.resize(345, 250);
      } else {
        figma.ui.resize(345, 124);
      }
      console.log(connectionState);
    } else if (selectedTab == "settings") {
      figma.ui.resize(345, 235);
    } else if (selectedTab == "usage") {
      figma.ui.resize(345, 586);
    }
  }

  if (eventType == "connectionCheck") {
    if (connectionState) {
      figma.ui.resize(345, 250);
    } else {
      figma.ui.resize(345, 124);
    }
  }
};
