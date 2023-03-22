import EventHub from "../services/events/events";

// input elements
const events = EventHub();
const $baseURL: HTMLInputElement | null = document.querySelector("#settings_dbLink");
const $clientKey: HTMLInputElement | null = document.querySelector("#settings_clientKey");
const $sourceKey: HTMLInputElement | null = document.querySelector("#settings_sourceKey");
const $annotationToggle: HTMLInputElement | null = document.querySelector("#annotationToggle");
const $button: HTMLButtonElement | null = document.querySelector(".c-plugin__btnConnect");

const checkConnection = async () => {
  // making sure there are no spaces in the values, even if the user typed spaces
  const baseURL: string | undefined = $baseURL?.value.replace(/\s/g, "").trim();
  const clientKey: string | undefined = $clientKey?.value.replace(/\s/g, "").trim();
  const sourceKey: string | undefined = $sourceKey?.value.replace(/\s/g, "").trim();
  $button?.addEventListener("click", () =>
    events.initializeClient(<string>baseURL, <string>clientKey, <string>sourceKey),
  );
  console.log(baseURL, clientKey);
};

const toggleAnnotations = (e: Event) => {
  const state: boolean = (<HTMLInputElement>e.target).checked;
  if (state === true) {
    console.log("show annotations");
  } else {
    console.log("hide annotations");
  }
};

const disableFields = () => {
  if (
    $baseURL !== null &&
    $clientKey !== null &&
    $annotationToggle !== null &&
    $button !== null &&
    $sourceKey !== null
  ) {
    $annotationToggle.disabled = true;
    $clientKey.disabled = true;
    $sourceKey.disabled = true;
    $button.removeEventListener("click", checkConnection);
  }
};

const disableFieldsWhenNecessary = () => {
  disableFields();
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
    if ($baseURL.value.replace(/\s/g, "") === "" || $clientKey.value.replace(/\s/g, "") === "") {
      $button.removeEventListener("click", checkConnection);
    }
    if ($baseURL.value.replace(/\s/g, "") !== "" && $clientKey.value.replace(/\s/g, "") !== "") {
      $sourceKey.disabled = false;
    }
    if (
      $baseURL.value.replace(/\s/g, "") !== "" &&
      $sourceKey.value.replace(/\s/g, "") !== "" &&
      $clientKey.value.replace(/\s/g, "") !== ""
    ) {
      $annotationToggle.disabled = false;
      $button.addEventListener("click", checkConnection);
    }
  }
};

const initAnnotationToggleEvents = () => {
  $annotationToggle?.addEventListener("click", toggleAnnotations);
  $baseURL?.addEventListener("keyup", disableFieldsWhenNecessary);
  $clientKey?.addEventListener("keyup", disableFieldsWhenNecessary);
  $sourceKey?.addEventListener("keyup", disableFieldsWhenNecessary);
};

const init = () => {
  disableFields();
  disableFieldsWhenNecessary();
  initAnnotationToggleEvents();
};

init();
