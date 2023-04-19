import { apiClient } from "../PZ_config";
import { EventHub } from "../services/events/EventHub";
import { Events } from "../services/events/Events";

//input elements
const $baseURL: HTMLInputElement | null = document.querySelector("#settings_dbLink");
const $clientKey: HTMLInputElement | null = document.querySelector("#settings_clientKey");
const $sourceKey: HTMLInputElement | null = document.querySelector("#settings_sourceKey");
const $projectKey: HTMLInputElement | null = document.querySelector("#settings_projectKey");
const $annotationToggle: HTMLInputElement | null = document.querySelector("#annotationToggle");
const $button: HTMLButtonElement | null = document.querySelector(".c-plugin__btnConnect");
//Spinner
const $spinner: HTMLElement | null = document.querySelector(".c-plugin__loader");
const $plugin: HTMLElement | null = document.querySelector(".js-settings-view");

// EventHub
const eventHub = new EventHub();

function initializeEventHubEvents() {
  eventHub.makeEvent(Events.DATA_INITIALIZED, () => {
    console.log("data initialized"); // TODO: remove
    eventHub.makeEvent(Events.DATA_INITIALIZED, () =>
      apiClient.getProject($projectKey?.value).then((project) => {
        if (!project || project === null) {
          throw new Error("Project does not exist");
        }
        apiClient.getAnnotations(project.itemKey, true).then(async (annotations) => {
          const annotation = annotations.find((a) => a.itemKey === "3414883772");
          await annotation?.archive().then(() => {
            annotation?.restore();
          });
        });
      }),
    );
  });
}

function checkConnectionSpinnerExample() {
  $plugin?.classList.add("no-pointer");
  $spinner?.removeAttribute("hidden");
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
  checkConnectionSpinnerExample();
  initAnnotationToggleEvents();
  initializeEventHubEvents();
  // TODO: add initialize for every event
}

initSettings();
