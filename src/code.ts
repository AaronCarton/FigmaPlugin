class messageTitle {
  public static readonly changeTab: string = "changeTab";
  public static readonly connectionCheck: string = "connectionCheck";
}

figma.showUI(__html__, { width: 345, height: 250 });

figma.ui.onmessage = (event) => {
  const eventType = event.type;
  const selectedTab = event.tab;
  const connectionState = event.connection;

  if (eventType == messageTitle.changeTab) {
    switch (selectedTab) {
      case "connect":
        if (connectionState) {
          figma.ui.resize(345, 250);
        } else {
          figma.ui.resize(345, 124);
        }
        break;
      case "settings":
        figma.ui.resize(345, 235);
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
};
async function retrieveFromStorage() {
  // todo: instead of samplevalue, receive the value from UI (input field)
  //Will test first if i can fill the input fields with the values from the storage
  try {
    await figma.clientStorage.setAsync("baseURL", "sampleBaseURL");
    const baseURL = await figma.clientStorage.getAsync("baseURL");
    figma.ui.postMessage({ type: "baseURL", payload: "baseURL: " + baseURL });
  } catch (err) {
    console.log(err);
  }

  // try {
  //   await figma.clientStorage.setAsync("clientKey", "sampleClientKey");
  //   const clientKey = await figma.clientStorage.getAsync("clientKey");
  //   figma.ui.postMessage({ type: "clientKey", payload: clientKey });
  // } catch (err) {
  //   console.log(err);
  // }

  // try {
  //   await figma.clientStorage.setAsync("sourceKey", "sampleSourceKey");
  //   const sourceKey = await figma.clientStorage.getAsync("sourceKey");
  //   figma.ui.postMessage({ type: "sourceKey", payload: sourceKey });
  // } catch (err) {
  //   console.log(err);
  // }
}
retrieveFromStorage();
// Listen for the 'message' event
figma.ui.onmessage = (event) => {
  // Check if the event data is what you expect
  // if (event.type === "changeTab") {
  //   // Handle the message
  //   console.log("Received custom message:", event.tab);
  // }
  // console.log("Received custom event out ifstatement:", event.tab);
  // console.log("type:", event.type);
};
