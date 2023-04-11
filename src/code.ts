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
async function areKeysSet(): Promise<boolean> {
  //Check if keys are set
  let areKeysSet = false;
  if (
    figma.clientStorage.getAsync("baseURL") != null &&
    figma.clientStorage.getAsync("clientKey") != null &&
    figma.clientStorage.getAsync("sourceKey") != null
  ) {
    areKeysSet = true;
  }
  return areKeysSet;
}
async function retrieveBaseURLFromStorage() {
  //Getting baseURL from storage
  try {
    if (figma.clientStorage.getAsync("baseURL") != null) {
      const baseURL = await figma.clientStorage.getAsync("baseURL");
      figma.ui.postMessage({ type: "baseURL", payload: "baseURL: " + baseURL });
    }
  } catch (err) {
    console.log(err);
  }
}

async function retrieveClientKeyFromStorage() {
  //Getting clientKey from storage
  try {
    if (figma.clientStorage.getAsync("clientKey") != null) {
      const clientKey = await figma.clientStorage.getAsync("clientKey");
      figma.ui.postMessage({ type: "clientKey", payload: "clientKey: " + clientKey });
    }
  } catch (err) {
    console.log(err);
  }
}

async function retrieveSourceKeyFromStorage() {
  //Getting sourceKey from storage
  try {
    if (figma.clientStorage.getAsync("sourceKey") != null) {
      const sourceKey = await figma.clientStorage.getAsync("sourceKey");
      figma.ui.postMessage({ type: "sourceKey", payload: "sourceKey: " + sourceKey });
    }
  } catch (err) {
    console.log(err);
  }
}
async function deleteKeys() {
  figma.clientStorage.deleteAsync("baseURL");
  figma.clientStorage.deleteAsync("clientKey");
  figma.clientStorage.deleteAsync("sourceKey");
  console.log("Keys deleted");
}
async function retrieveDataFromStorage() {
  if (await areKeysSet()) {
    retrieveBaseURLFromStorage();
    retrieveClientKeyFromStorage();
    retrieveSourceKeyFromStorage();
  }
}
async function setBaseUrl(baseURL: string) {
  try {
    await figma.clientStorage.setAsync("baseURL", baseURL);
  } catch (err) {
    console.log(err);
  }
}
async function setClientKey(clientKey: string) {
  try {
    await figma.clientStorage.setAsync("clientKey", clientKey);
  } catch (err) {
    console.log(err);
  }
}
async function setSourceKey(sourceKey: string) {
  try {
    await figma.clientStorage.setAsync("sourceKey", sourceKey);
  } catch (err) {
    console.log(err);
  }
}
retrieveDataFromStorage();
//deleteKeys(); //For testing purposes

// Listen for the 'setKeys' event
//This will receive the keys from the UI and set the keys in the storage
figma.ui.onmessage = (event) => {
  // Check if the event data is what you expect
  if (event.type === "setKeys") {
    // Handle the message
    setBaseUrl(event.baseURL);
    setClientKey(event.clientKey);
    setSourceKey(event.sourceKey);
  }
};
