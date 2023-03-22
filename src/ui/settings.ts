//input elements
const $baseURL: HTMLInputElement | null = document.querySelector("#settings_dbLink");
const $clientKey: HTMLInputElement | null = document.querySelector("#settings_clientKey");
const $sourceKey: HTMLInputElement | null = document.querySelector("#settings_sourceKey");
const $annotationToggle: HTMLInputElement | null = document.querySelector("#annotationToggle");
const $button: HTMLButtonElement | null = document.querySelector(".c-plugin__btnConnect");

const checkConnection = async () => {
  //making sure there are no spaces in the values, even if the user typed spaces
  const baseURL: string | null | undefined = $baseURL?.value.replace(/\s/g, "").trim();
  const clientKey: string | null | undefined = $clientKey?.value.replace(/\s/g, "").trim();
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
  if ($baseURL !== null && $clientKey !== null && $annotationToggle !== null && $button !== null) {
    $annotationToggle.disabled = true;
    $clientKey.disabled = true;
    $button.removeEventListener("click", checkConnection);
  }
};

const disableFieldsWhenNecessary = () => {
  disableFields();
  if ($baseURL !== null && $clientKey !== null && $annotationToggle !== null && $button !== null) {
    //replace makes sure people can not connect with empty strings (for example pressing spacebar)
    if ($baseURL.value.replace(/\s/g, "") !== "") {
      $clientKey.disabled = false;
    }
    if ($baseURL.value.replace(/\s/g, "") !== "" && $clientKey.value.replace(/\s/g, "") !== "") {
      $annotationToggle.disabled = false;
      $button.addEventListener("click", checkConnection);
    }
  }
};

const initAnnotationToggleEvents = () => {
  $annotationToggle?.addEventListener("click", toggleAnnotations);
  $baseURL?.addEventListener("keyup", disableFieldsWhenNecessary);
  $clientKey?.addEventListener("keyup", disableFieldsWhenNecessary);
};

const init = () => {
  disableFields();
  disableFieldsWhenNecessary();
  initAnnotationToggleEvents();
};

init();
