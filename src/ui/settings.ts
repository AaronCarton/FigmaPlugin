//input elements
const $dbURL: HTMLInputElement | null = document.querySelector("#settings_dbLink");
const $apiKey: HTMLInputElement | null = document.querySelector("#settings_apiKey");
const $annotationToggle: HTMLInputElement | null = document.querySelector("#annotationToggle");
const $button: HTMLButtonElement | null = document.querySelector(".c-plugin__btnConnect");
//spinner
const $spinner: HTMLElement | null = document.querySelector(".c-plugin__loader");
const $plugin: HTMLElement | null = document.querySelector(".js-settings-view");
const checkConnection = async () => {
  //adding spinner + adding no pointer class
  $plugin?.classList.add("no-pointer");
  $spinner?.removeAttribute("hidden");
  const dbURL: string | null | undefined = $dbURL?.value.replace(/\s/g, "").trim();
  const apiKey: string | null | undefined = $apiKey?.value.replace(/\s/g, "").trim();
  console.log(dbURL, apiKey);
  fetch("https://www.mocky.io/v2/5185415ba171ea3a00704eed?mocky-delay=5000ms")
    .then((response) => response.json())
    .then(() => {
      $plugin?.classList.remove("no-pointer");
      $spinner?.setAttribute("hidden", "");
    });
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
  if ($dbURL !== null && $apiKey !== null && $annotationToggle !== null && $button !== null) {
    $annotationToggle.disabled = true;
    //replace makes sure people can not connect with empty strings (for example pressing spacebar)
    if ($dbURL.value.replace(/\s/g, "") !== "") {
      $apiKey.disabled = false;
    } else {
      $apiKey.disabled = true;
    }
    if ($dbURL.value.replace(/\s/g, "") === "" || $apiKey.value.replace(/\s/g, "") === "") {
      $button.removeEventListener("click", checkConnection);
    }
    if ($dbURL.value.replace(/\s/g, "") !== "" && $apiKey.value.replace(/\s/g, "") !== "") {
      $annotationToggle.disabled = false;
      $button.addEventListener("click", checkConnection);
    }
  }
};

const init = () => {
  disableFields();
  $annotationToggle?.addEventListener("click", toggleAnnotations);
  $dbURL?.addEventListener("keyup", disableFields);
  $apiKey?.addEventListener("keyup", disableFields);
};

init();