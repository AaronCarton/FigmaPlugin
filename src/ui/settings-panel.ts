import Annotation from "../interfaces/interface.annotation";
import { ODSFacet } from "../interfaces/ods/interface.ODSresponse";
import ApiClient from "../services/api/client";
import EventHub from "../services/events/EventHub";
import { Events } from "../services/events/Events";
import { BaseComponent } from "./baseComponent";
import { changeConnectionState } from "./navigation-tabs";

//input elements
export const $button: HTMLButtonElement | null = document.querySelector(".c-settings__btnConnect");
export const $date: HTMLElement | null = document.querySelector(".c-settings__date");
const $baseURL: HTMLInputElement | null = document.querySelector("#settings_dbLink");
const $clientKey: HTMLInputElement | null = document.querySelector("#settings_clientKey");
const $sourceKey: HTMLInputElement | null = document.querySelector("#settings_sourceKey");
const $annotationToggle: HTMLInputElement | null = document.querySelector("#annotationToggle");

let projectKey: string = "";
//Spinner
const $spinner: HTMLElement | null = document.querySelector(".c-spinner");
const $plugin: HTMLElement | null = document.querySelector(".c-content");

export class Settings extends BaseComponent {
  componentType = "Settings";

  constructor() {
    super();
  }

  initComponent(): void {
    this.disableFieldsWhenNecessary();
    this.initializeEventHubEvents();
    this.initAnnotationToggleEvents();
    $annotationToggle?.addEventListener("click", this.toggleAnnotations);
    $button?.addEventListener("click", (e: Event) => {
      e.preventDefault();
      this.connect();
      $button.disabled = true;
    });
  }

  initializeEventHubEvents() {
    ApiClient.initializeEvents();
    EventHub.getInstance().makeEvent(Events.ANNOTATIONS_FETCHED, (annotations: Annotation[]) => {
      const currentTime: string = new Date().toLocaleString("en-GB").replace(",", "");

      if ($button && $date) {
        $button.innerHTML = "Refresh";
        $date.innerText = currentTime;
        $button.disabled = false;
      }

      changeConnectionState(true);
      spinnerEvents();
    });
    EventHub.getInstance().makeEvent(Events.FACETS_FETCHED, (facets: ODSFacet[]) => {
      const data = Object.fromEntries(facets.map((f) => [f.name, f.values.map((v) => v.value)]));
      Object.keys(data).forEach((key) => {
        this.loadDropdowns(key, data[key]);
      });
    });

    EventHub.getInstance().makeEvent(Events.LOCAL_STORAGE_FETCHED, ({ baseURL, clientKey, sourceKey, lastUpdate }) => {
      $baseURL?.setAttribute("value", baseURL || "");
      $clientKey?.setAttribute("value", clientKey || "");
      $sourceKey?.setAttribute("value", sourceKey || "");
      this.disableFieldsWhenNecessary();

      if ($date) {
        $date.innerText = lastUpdate || "";
      }

      // TODO: emit event to initialize data right away, because we got the values from localStorage
      // KEEP THIS
      // EventHub.getInstance().sendCustomEvent(Events.INITIALIZE_DATA, {
      //   $projectKey: projectKey,
      //   baseURL,
      //   clientKey,
      //   sourceKey,
      // });
    });

    EventHub.getInstance().makeEvent(Events.API_ERROR, (message) => {
      $button?.removeAttribute("disabled");
      EventHub.getInstance().sendCustomEvent(Events.FIGMA_ERROR, message);
    });

    EventHub.getInstance().makeEvent(Events.PROJECT_KEY_FETCHED, (pk) => {
      projectKey = pk;
    });

    EventHub.getInstance().sendCustomEvent(Events.FETCH_LOCAL_STORAGE, null);
    EventHub.getInstance().sendCustomEvent(Events.FETCH_PROJECT_KEY, null);
  }

  connect() {
    const currentTime: string = new Date().toLocaleString("en-GB").replace(",", "");
    EventHub.getInstance().sendCustomEvent(Events.INITIALIZE_DATA, {
      baseURL: $baseURL?.value || "",
      clientKey: $clientKey?.value || "",
      sourceKey: $sourceKey?.value || "",
      filters: {
        projectKey: [projectKey],
      },
    });
    spinnerEvents();

    EventHub.getInstance().sendCustomEvent(Events.SET_LOCAL_STORAGE, {
      baseURL: $baseURL?.value || "",
      clientKey: $clientKey?.value || "",
      sourceKey: $sourceKey?.value || "",
      lastUpdate: currentTime,
    });

    toggleShowAnnotations();
  }

  loadDropdowns(elementName: string, data: string[]) {
    const $dropDown: HTMLSelectElement | null = document.querySelector(`.js-${elementName}`);
    const texts: { [key: string]: string } = {
      dataSource: "Choose source",
      entity: "Choose entity",
      attribute: "Choose attribute",
      dataType: "Choose data type",
    };

    if ($dropDown) {
      // remove all options
      $dropDown.options.length = 0;
      // add default option
      const defaultOption = new Option(texts[elementName], "");
      defaultOption.disabled = true;
      defaultOption.selected = true;
      $dropDown.add(defaultOption);
    }
    data.forEach((element) => {
      const newOption = new Option(element, element);
      $dropDown?.add(newOption);
    });
  }

  toggleAnnotations(e: Event) {
    const state: boolean = (<HTMLInputElement>e.target).checked;
    EventHub.getInstance().sendCustomEvent(Events.UI_CHANGE_VISIBILITY, state);
  }

  disableFieldsWhenNecessary() {
    if ($baseURL !== null && $clientKey !== null && $annotationToggle !== null && $button !== null && $sourceKey !== null) {
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
      if ($baseURL.value.replace(/\s/g, "") !== "" && $sourceKey.value.replace(/\s/g, "") !== "" && $clientKey.value.replace(/\s/g, "") !== "") {
        $annotationToggle.disabled = false;
        $button.disabled = false;
        $button.classList.add("button-pointer");
      } else {
        $annotationToggle.disabled = true;
        $button.disabled = true;
        $button.classList.remove("button-pointer");
      }
    }
  }

  initAnnotationToggleEvents() {
    $annotationToggle?.addEventListener("click", this.toggleAnnotations);
    $baseURL?.addEventListener("keyup", this.disableFieldsWhenNecessary);
    $clientKey?.addEventListener("keyup", this.disableFieldsWhenNecessary);
    $sourceKey?.addEventListener("keyup", this.disableFieldsWhenNecessary);
  }
}
function toggleShowAnnotations() {
  if ($annotationToggle) {
    $annotationToggle.checked = true;
  }
}
function spinnerEvents() {
  $spinner?.classList.toggle("is-active");
  $plugin?.classList.toggle("no-pointer");
}
