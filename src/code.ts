figma.showUI(__html__, { width: 345, height: 250 });

figma.ui.onmessage = (event) => {
  const eventType = event.type;
  const selectedTab = event.tab;
  if (eventType == "changeTab") {
    if (selectedTab == "connect") {
      figma.ui.resize(345, 250);
    } else if (selectedTab == "settings") {
      figma.ui.resize(345, 235);
    } else if (selectedTab == "usage") {
      figma.ui.resize(345, 586);
    }
  }
};
