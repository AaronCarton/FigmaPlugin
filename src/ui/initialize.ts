const $baseURL: HTMLInputElement | null = document.querySelector("#settings_dbLink");
const $clientKey: HTMLInputElement | null = document.querySelector("#settings_clientKey");
const $sourceKey: HTMLInputElement | null = document.querySelector("#settings_sourceKey");
const $button: HTMLButtonElement | null = document.querySelector(".c-plugin__btnConnect");
const settingsTab: HTMLElement | null = document.querySelector(".a-settings-tab");

export async function getBaseURLFromFigmaStorage(): Promise<string> {
  return new Promise((resolve) => {
    window.addEventListener("message", (event) => {
      // Check if the event data is what you expect
      const payload = event.data.pluginMessage.payload;
      if (event.data.pluginMessage.payload.substring(0, 9) === "baseURL: ") {
        // Handle the event
        const baseURL = payload.substring(9);
        console.log("baseURL in event", baseURL);
        resolve(baseURL);
      }
    });
  });
}
async function getClientKeyFromFigmaStorage(): Promise<string> {
  return new Promise((resolve) => {
    window.addEventListener("message", (event) => {
      // Check if the event data is what you expect
      const payload = event.data.pluginMessage.payload;
      if (event.data.pluginMessage.payload.substring(0, 11) === "clientKey: ") {
        // Handle the event
        const clientKey = payload.substring(11);
        console.log("client in event", clientKey);
        resolve(clientKey);
      }
    });
  });
}
async function getSourceKeyFromFigmaStorage(): Promise<string> {
  return new Promise((resolve) => {
    window.addEventListener("message", (event) => {
      // Check if the event data is what you expect
      const payload = event.data.pluginMessage.payload;
      if (event.data.pluginMessage.payload.substring(0, 11) === "sourceKey: ") {
        // Handle the event
        const sourceKey = payload.substring(11);
        console.log("sourceKey in event", sourceKey);
        resolve(sourceKey);
      }
    });
  });
}

function fillBaseUrlInInputfields(baseURL: string) {
  if (settingsTab !== null) {
    settingsTab.addEventListener("click", () => {
      // do something when the settings tab is clicked
      $baseURL?.setAttribute("value", baseURL);
    });
  }
}
function fillClientKeyInInputfields(clientKey: string) {
  if (settingsTab !== null) {
    settingsTab.addEventListener("click", () => {
      // do something when the settings tab is clicked
      $clientKey?.setAttribute("value", clientKey);
    });
  }
}

function fillSourceKeyInInputfields(sourceKey: string) {
  if (settingsTab !== null) {
    settingsTab.addEventListener("click", () => {
      // do something when the settings tab is clicked
      $sourceKey?.setAttribute("value", sourceKey);
    });
  }
}

function connect() {
  const baseURL = $baseURL?.value;
  const clientKey = $clientKey?.value;
  const sourceKey = $sourceKey?.value;
  console.log("baseURL", baseURL);
  console.log("clientKey", clientKey);
  console.log("sourceKey", sourceKey);
  // Still needs a way to check if the entered keys are actually conntected to the right db

  parent.postMessage(
    {
      pluginMessage: {
        type: "setKeys",
        baseURL: baseURL,
        clientKey: clientKey,
        sourceKey: sourceKey,
      },
    },
    "*",
  );
}

function initialize() {
  getBaseURLFromFigmaStorage().then((url) => {
    fillBaseUrlInInputfields(url);
  });
  getClientKeyFromFigmaStorage().then((clientkey) => {
    fillClientKeyInInputfields(clientkey);
  });
  getSourceKeyFromFigmaStorage().then((sourceKey) => {
    fillSourceKeyInInputfields(sourceKey);
  });
  if ($button !== null) {
    $button.addEventListener("click", connect);
  }
}

initialize();
