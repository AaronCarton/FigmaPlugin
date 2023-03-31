class messageTitle {
  public static readonly changeTab: string = "changeTab";
  public static readonly connectionCheck: string = "connectionCheck";
  public static readonly createText: string = "createText";
}

async function loadFonts() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
}

function createAnnotation(inputValues: string[]) {
  const page = figma.currentPage;
  const frame = figma.createFrame();
  frame.name = "Annotation";
  frame.x = figma.viewport.center.x;
  frame.y = figma.viewport.center.y;
  frame.resize(320, 130);
  page.appendChild(frame);

  frame.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.96, b: 1 } }];
  frame.strokes = [{ type: "SOLID", color: { r: 0.05, g: 0.6, b: 1 } }];
  frame.strokeWeight = 1;
  frame.strokeAlign = "CENTER";
  frame.strokeCap = "ROUND";
  frame.strokeJoin = "ROUND";
  frame.dashPattern = [10, 5];
  frame.cornerRadius = 10;

  const textTitles = ["Data source", "Entity", "Attribute", "Data type", "Sample value"];
  const textValues = [
    inputValues[0],
    inputValues[1],
    inputValues[2],
    inputValues[3],
    inputValues[4],
  ];

  for (let i = 0; i < 5; i++) {
    const titlesNode = figma.createText();
    titlesNode.name = textTitles[i];
    titlesNode.characters = textTitles[i].toString();
    titlesNode.fontSize = 11;
    titlesNode.x = 15;
    titlesNode.y = 22 * i + 15;
    titlesNode.fontName = { family: "Inter", style: "Semi Bold" };
    titlesNode.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
    frame.appendChild(titlesNode);
  }

  for (let i = 0; i < 5; i++) {
    const valuesNode = figma.createText();
    valuesNode.name = textValues[i];
    valuesNode.characters = textValues[i].toString();
    valuesNode.fontSize = 11;
    valuesNode.x = 105;
    valuesNode.y = 22 * i + 15;
    valuesNode.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
    frame.appendChild(valuesNode);
  }

  frame.locked = true;
  frame.visible = true;
}

figma.showUI(__html__, { width: 345, height: 250 });

figma.ui.onmessage = (event) => {
  const eventType = event.type;
  const selectedTab = event.tab;
  const connectionState = event.connection;

  loadFonts();

  if (eventType == messageTitle.changeTab) {
    switch (selectedTab) {
      case "connect":
        if (connectionState) {
          figma.ui.resize(345, 250);
        } else {
          figma.ui.resize(345, 124);
        }
        console.log(connectionState);
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

  if (eventType == messageTitle.connectionCheck) {
    if (connectionState) {
      figma.ui.resize(345, 250);
    } else {
      figma.ui.resize(345, 124);
    }
  }

  if (eventType == messageTitle.createText) {
    createAnnotation(event.values);
  }
};

figma.on("close", async () => {
  console.log("closing");
  figma.currentPage.children.forEach((child) => {
    if (child.name === "Annotation") {
      child.remove();
    }
  });
});
