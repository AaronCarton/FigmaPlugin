const $baseURL: HTMLInputElement | null = document.querySelector("#settings_dbLink");
const $clientKey: HTMLInputElement | null = document.querySelector("#settings_clientKey");
const $sourceKey: HTMLInputElement | null = document.querySelector("#settings_sourceKey");
const $button: HTMLButtonElement | null = document.querySelector(".c-plugin__btnConnect");
const settingsTab: HTMLElement | null = document.querySelector(".a-settings-tab");

//setters will be called when user successfully connects to the db
export async function getBaseURLFromFigmaStorage(): Promise<string> {
  return new Promise((resolve) => {
    window.addEventListener("message", (event) => {
      // Check if the event data is what you expect
      const payload = event.data.pluginMessage.payload;
      if (event.data.pluginMessage.payload.substring(0, 9) === "baseURL: ") {
        // Handle the event
        const url = payload.substring(9);
        console.log("url in event", url);
        resolve(url);
      }
    });
  });
}

export function checkIfKeysAreSet() {
  //   if (isBaseUrlSet() && isClientKeySet() && isSourceKeySet()) {
  //     return true;
  //   } else {
  //     return false;
  //   }
}
//this function will be called when user clicks on connect and the keys are NOT  set
export function setAllKeys(baseURLValue: string, clientKeyValue: string, sourceKeyValue: string) {
  // setBaseUrl(baseURLValue);
  // setClientKey(clientKeyValue);
  // setSourceKey(sourceKeyValue);
}
export function fillInputfields() {
  // if ($baseURL !== null && $clientKey !== null && $sourceKey !== null) {
  //   $baseURL.setAttribute("value", getBaseURLFromFigmaStorage());
  // }
}
export function checkIfSettingsTabIsSelected(url: string) {
  console.log("baseurl: " + $baseURL?.value);
  if (settingsTab !== null) {
    settingsTab.addEventListener("click", () => {
      // do something when the settings tab is clicked
      console.log("getter :" + getBaseURLFromFigmaStorage());
      $baseURL?.setAttribute("value", url);
      console.log("baseurl after click: " + $baseURL?.value);
    });
  }
}
function initialize() {
  // if (checkIfKeysAreSet()) {
  //   fillInputfields();
  // }
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
getBaseURLFromFigmaStorage().then((url) => {
  console.log("url in then", url);
  checkIfSettingsTabIsSelected(url);
});

// //scenario: if the keys aren't set do nothing, if they are set fill the input fields with the values
// //when user clicks on connect (if keys are NOT set) -> set the keys

// // need 2 functions: First, at startup check if keys are set, if they are set fill the input fields with the values
// // Second, when user clicks on connect (if keys are NOT set) -> set the keys
