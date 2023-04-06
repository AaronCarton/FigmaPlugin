const $baseURL: HTMLInputElement | null = document.querySelector("#settings_dbLink");
const $clientKey: HTMLInputElement | null = document.querySelector("#settings_clientKey");
const $sourceKey: HTMLInputElement | null = document.querySelector("#settings_sourceKey");
const $button: HTMLButtonElement | null = document.querySelector(".c-plugin__btnConnect");

//setters will be called when user successfully connects to the db
function receiveBaseURLFromFigmaStorage() {
  window.addEventListener("message", (event) => {
    // Check if the event data is what you expect
    if (event.data.pluginMessage.payload === "...") {
      //TODO looking for "baseURL": with a substring
      // Handle the event
    }
    console.log("Event from figma to UI:", event.data.pluginMessage.payload);
    console.log("type from figma to UI:", event.type);
  });
}
export function checkIfKeysAreSet() {
  if (isBaseUrlSet() && isClientKeySet() && isSourceKeySet()) {
    return true;
  } else {
    return false;
  }
}
//this function will be called when user clicks on connect and the keys are NOT  set
export function setAllKeys(baseURLValue: string, clientKeyValue: string, sourceKeyValue: string) {
  setBaseUrl(baseURLValue);
  setClientKey(clientKeyValue);
  setSourceKey(sourceKeyValue);
}
function fillInputfields() {
  // if ($baseURL !== null && $clientKey !== null && $sourceKey !== null) {
  //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //   $baseURL.value = localStorage.getItem("baseURL")!;
  //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //   $clientKey.value = localStorage.getItem("clientKey")!;
  //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //   $sourceKey.value = localStorage.getItem("sourceKey")!;
  // }
}
function initialize() {
  if (checkIfKeysAreSet()) {
    fillInputfields();
  }
}
function connect() {
  // if ($baseURL !== null && $clientKey !== null && $sourceKey !== null) {
  //   if (!checkIfKeysAreSet()) {
  //     setAllKeys($baseURL.value, $clientKey.value, $sourceKey.value);
  //     console.log(localStorage.getItem("baseURL"));
  //   }
  // }
}
initialize();
if ($button !== null) {
  $button.addEventListener("click", connect);
}

// initialize();

// //scenario: if the keys aren't set do nothing, if they are set fill the input fields with the values
// //when user clicks on connect (if keys are NOT set) -> set the keys

// // need 2 functions: First, at startup check if keys are set, if they are set fill the input fields with the values
// // Second, when user clicks on connect (if keys are NOT set) -> set the keys
