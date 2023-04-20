import { FigmaLocalStorage } from "./figmaLocalStorage";
//input elements
const $baseURL: HTMLInputElement | null = document.querySelector("#settings_dbLink");
const $clientKey: HTMLInputElement | null = document.querySelector("#settings_clientKey");
const $sourceKey: HTMLInputElement | null = document.querySelector("#settings_sourceKey");
const $annotationToggle: HTMLInputElement | null = document.querySelector("#annotationToggle");
const $button: HTMLButtonElement | null = document.querySelector(".c-plugin__btnConnect");
//Spinner
const $spinner: HTMLElement | null = document.querySelector(".c-plugin__loader");
const $plugin: HTMLElement | null = document.querySelector(".js-settings-view");
//Settings tab
const settingsTab: HTMLElement | null = document.querySelector(".a-settings-tab");
//Initialize local storage
const figmaLocalStorage = new FigmaLocalStorage();

function checkConnectionSpinnerExample() {
  $plugin?.classList.add("no-pointer");
  $spinner?.removeAttribute("hidden");
  // const dbURL: string | null | undefined = $dbURL?.value.replace(/\s/g, "").trim();
  // const apiKey: string | null | undefined = $apiKey?.value.replace(/\s/g, "").trim();
  fetch("https://www.mocky.io/v2/5185415ba171ea3a00704eed?mocky-delay=5000ms")
    .then((response) => response.json())
    .then(() => {
      $plugin?.classList.remove("no-pointer");
      $spinner?.setAttribute("hidden", "");
    });
}

function toggleAnnotations(e: Event) {
  const state: boolean = (<HTMLInputElement>e.target).checked;
  if (state === true) {
    console.log("show annotations");
  } else {
    console.log("hide annotations");
  }
}

function disableFieldsWhenNecessary() {
  console.log($baseURL?.value.replace(/\s/g, ""));
  if (
    $baseURL !== null &&
    $clientKey !== null &&
    $annotationToggle !== null &&
    $button !== null &&
    $sourceKey !== null
  ) {
    //replace makes sure people can not connect with empty strings (for example pressing spacebar)
    if ($baseURL.value.replace(/\s/g, "") !== "") {
      $clientKey.disabled = false;
      $sourceKey.disabled = false;
    } else {
      $clientKey.disabled = true;
      $sourceKey.disabled = true;
    }
    if (
      $baseURL.value.replace(/\s/g, "") !== "" &&
      $sourceKey.value.replace(/\s/g, "") !== "" &&
      $clientKey.value.replace(/\s/g, "") !== ""
    ) {
      $annotationToggle.disabled = false;
      $button.addEventListener("click", checkConnection);
    } else {
      $annotationToggle.disabled = true;
      $button.removeEventListener("click", checkConnection);
    }
  }
}
async function checkConnection() {
  //making sure there are no spaces in the values, even if the user typed spaces
  const baseURL: string | null | undefined = $baseURL?.value.replace(/\s/g, "").trim();
  const clientKey: string | null | undefined = $clientKey?.value.replace(/\s/g, "").trim();
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

// function fillKeysInInputfields(baseURL: string, clientKey: string, sourceKey: string) {
//   if (settingsTab !== null) {
//     settingsTab.addEventListener("click", () => {
//       // do something when the settings tab is clicked
//       $baseURL?.setAttribute("value", baseURL);
//       $clientKey?.setAttribute("value", clientKey);
//       $sourceKey?.setAttribute("value", sourceKey);
//     });
//   }
// }

function connect() {
  const baseURL = $baseURL?.value;
  const clientKey = $clientKey?.value;
  const sourceKey = $sourceKey?.value;

  // Still needs a way to check if the entered keys are actually conntected to the right db
  figmaLocalStorage.sendKeysToLocalStorage(baseURL, clientKey, sourceKey);
}

function initAnnotationToggleEvents() {
  $annotationToggle?.addEventListener("click", toggleAnnotations);
  $baseURL?.addEventListener("keyup", disableFieldsWhenNecessary);
  $clientKey?.addEventListener("keyup", disableFieldsWhenNecessary);
  $sourceKey?.addEventListener("keyup", disableFieldsWhenNecessary);
}

function loadKeysFromLocalStorage() {
  // figmaLocalStorage.getBaseURLFromFigmaStorage().then((baseURL) => {
  //   if (baseURL !== null) {
  //     fillBaseUrlInInputfields(baseURL);
  //   }
  // });

  if ($baseURL !== null) {
    // console.log("in settings", figmaLocalStorage.getBaseURLFromFigmaStorage());
    fillBaseUrlInInputfields(figmaLocalStorage.getBaseURLFromFigmaStorage() as string);
  }

  // figmaLocalStorage.getClientKeyFromFigmaStorage().then((clientKey) => {
  //   if (clientKey !== null) {
  //     fillClientKeyInInputfields(clientKey);
  //   }
  // });
  // figmaLocalStorage.getSourceKeyFromFigmaStorage().then((sourceKey) => {
  //   if (sourceKey !== null) {
  //     fillSourceKeyInInputfields(sourceKey);
  //   }
  // });
  if ($button !== null) {
    $button.addEventListener("click", connect);
  }
}

function initSettings() {
  window.addEventListener("loadSettings", (event: Event) => {
    console.log("settings loaded", event.type);
    loadKeysFromLocalStorage();
    initAnnotationToggleEvents();
    disableFieldsWhenNecessary();
    console.log("end settings");
  });

  // Todo: remove after test
  // settingsTab?.addEventListener("click", () =>
  //   // window.dispatchEvent(new CustomEvent("testMessage")),
  // );
}

initSettings();
