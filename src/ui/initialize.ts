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
export async function getClientKeyFromFigmaStorage(): Promise<string> {
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
export async function getSourceKeyFromFigmaStorage(): Promise<string> {
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

export function fillBaseUrlInInputfields(baseURL: string) {
  if (settingsTab !== null) {
    settingsTab.addEventListener("click", () => {
      // do something when the settings tab is clicked
      $baseURL?.setAttribute("value", baseURL);
    });
  }
}
export function fillClientKeyInInputfields(clientKey: string) {
  if (settingsTab !== null) {
    settingsTab.addEventListener("click", () => {
      // do something when the settings tab is clicked
      $clientKey?.setAttribute("value", clientKey);
    });
  }
}

export function fillSourceKeyInInputfields(sourceKey: string) {
  if (settingsTab !== null) {
    settingsTab.addEventListener("click", () => {
      // do something when the settings tab is clicked
      $sourceKey?.setAttribute("value", sourceKey);
    });
  }
}
function initialize() {
  getBaseURLFromFigmaStorage().then((url) => {
    console.log("url in then", url);
    fillBaseUrlInInputfields(url);
  });
  getClientKeyFromFigmaStorage().then((clientkey) => {
    console.log("clientkey in then", clientkey);
    fillClientKeyInInputfields(clientkey);
  });
  getSourceKeyFromFigmaStorage().then((sourceKey) => {
    console.log("sourceKey in then", sourceKey);
    fillSourceKeyInInputfields(sourceKey);
  });
}
function connect() {
  // if ($baseURL !== null && $clientKey !== null && $sourceKey !== null) {
  //   if (!checkIfKeysAreSet()) {
  //     setAllKeys($baseURL.value, $clientKey.value, $sourceKey.value);
  //     console.log(localStorage.getItem("baseURL"));
  //   }
  // }
}
if ($button !== null) {
  $button.addEventListener("click", connect);
}

initialize();
// //scenario: if the keys aren't set do nothing, if they are set fill the input fields with the values
// //when user clicks on connect (if keys are NOT set) -> set the keys

// // need 2 functions: First, at startup check if keys are set, if they are set fill the input fields with the values
// // Second, when user clicks on connect (if keys are NOT set) -> set the keys
