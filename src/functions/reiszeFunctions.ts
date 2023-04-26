export function resizeByTab(tab: string, connection: boolean) {
  console.log("Resize");
  switch (tab) {
    case "connect":
      resizeByConnection(connection);
      break;
    case "settings":
      figma.ui.resize(345, 355);
      break;
    case "usage":
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
    figma.ui.resize(345, 124);
  }
}
