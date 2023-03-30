//input elements
const $baseURL: HTMLInputElement | null = document.querySelector("#settings_dbLink");
const $clientKey: HTMLInputElement | null = document.querySelector("#settings_clientKey");
const $sourceKey: HTMLInputElement | null = document.querySelector("#settings_sourceKey");
const $annotationToggle: HTMLInputElement | null = document.querySelector("#annotationToggle");
const $button: HTMLButtonElement | null = document.querySelector(".c-settings__btnConnect");

async function checkConnection() {
  //making sure there are no spaces in the values, even if the user typed spaces
  const baseURL: string | null | undefined = $baseURL?.value.replace(/\s/g, "").trim();
  const clientKey: string | null | undefined = $clientKey?.value.replace(/\s/g, "").trim();
  console.log(baseURL, clientKey);
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

function initAnnotationToggleEvents() {
  $annotationToggle?.addEventListener("click", toggleAnnotations);
  $baseURL?.addEventListener("keyup", disableFieldsWhenNecessary);
  $clientKey?.addEventListener("keyup", disableFieldsWhenNecessary);
  $sourceKey?.addEventListener("keyup", disableFieldsWhenNecessary);
}

function init() {
  disableFieldsWhenNecessary();
  initAnnotationToggleEvents();
}

init();
