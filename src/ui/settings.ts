<<<<<<<<< Temporary merge branch 1
//input elements
const $baseURL: HTMLInputElement | null = document.querySelector("#settings_dbLink");
const $clientKey: HTMLInputElement | null = document.querySelector("#settings_clientKey");
const $sourceKey: HTMLInputElement | null = document.querySelector("#settings_sourceKey");
=========
//Input elements
const $dbURL: HTMLInputElement | null = document.querySelector("#settings_dbLink");
const $apiKey: HTMLInputElement | null = document.querySelector("#settings_apiKey");
>>>>>>>>> Temporary merge branch 2
const $annotationToggle: HTMLInputElement | null = document.querySelector("#annotationToggle");
const $button: HTMLButtonElement | null = document.querySelector(".c-plugin__btnConnect");
//Spinner
const $spinner: HTMLElement | null = document.querySelector(".c-plugin__loader");
const $plugin: HTMLElement | null = document.querySelector(".js-settings-view");

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
  // add functionality for button??
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
    } else {
      $clientKey.disabled = true;
    }
    if ($baseURL.value.replace(/\s/g, "") !== "" && $clientKey.value.replace(/\s/g, "") !== "") {
      $sourceKey.disabled = false;
    } else {
      $sourceKey.disabled = true;
    }
    if ($dbURL.value.replace(/\s/g, "") !== "" && $apiKey.value.replace(/\s/g, "") !== "") {
      $annotationToggle.disabled = false;
      $button.addEventListener("click", checkConnectionSpinnerExample);
    }
  } else {
    $annotationToggle.disabled = true;
    $button.removeEventListener("click", checkConnectionSpinnerExample);
  }
}

function initAnnotationToggleEvents() {
  $annotationToggle?.addEventListener("click", toggleAnnotations);
  $baseURL?.addEventListener("keyup", disableFieldsWhenNecessary);
  $clientKey?.addEventListener("keyup", disableFieldsWhenNecessary);
  $sourceKey?.addEventListener("keyup", disableFieldsWhenNecessary);
}

function initSettings() {
  disableFieldsWhenNecessary();
  initAnnotationToggleEvents();
}

initSettings();
