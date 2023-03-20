figma.showUI(__html__, { width: 345, height: 250 });

figma.ui.onmessage = (event) => {
  const eventType = event.type;
  if (eventType == "connectSelected") {
    figma.ui.resize(345, 250);
  } else if (eventType == "settingsSelected") {
    figma.ui.resize(345, 235);
  } else if (eventType == "usageSelected") {
    figma.ui.resize(345, 586);
  }
};
