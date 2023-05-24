import { getTimeAgo } from "../functions/getTimeAgo";
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
const dataTypes = ["int", "float", "char", "string", "bool", "enum", "array", "date", "time", "datetime"];

//Spinner
const $spinner: HTMLElement | null = document.querySelector(".c-spinner");
const $plugin: HTMLElement | null = document.querySelector(".c-content");

let timeInterval: number;

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
      if ($button && $date) {
        $button.innerHTML = "Refresh";
        $button.disabled = false;

        this.lastUpdatedInterval(new Date()); // restart last updated interval
      }

      changeConnectionState(true);
      toggleSpinner();
    });
    EventHub.getInstance().makeEvent(Events.FACETS_FETCHED, (facets: ODSFacet[]) => {
      const data = Object.fromEntries(facets.map((f) => [f.name, f.values.map((v) => v.value)]));
      Object.keys(data).forEach((key) => {
        this.loadDropdowns(key, data[key]);
      });
      this.loadDropdowns("dataType", dataTypes);
    });

    EventHub.getInstance().makeEvent(Events.LOCAL_STORAGE_FETCHED, ({ baseURL, clientKey, sourceKey }) => {
      $baseURL?.setAttribute("value", baseURL || "");
      $clientKey?.setAttribute("value", clientKey || "");
      $sourceKey?.setAttribute("value", sourceKey || "");
      this.disableFieldsWhenNecessary();

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
      toggleSpinner();
      EventHub.getInstance().sendCustomEvent(Events.FIGMA_ERROR, message);
    });

    EventHub.getInstance().makeEvent(Events.PROJECT_KEY_FETCHED, (pk) => {
      projectKey = pk;
    });

    EventHub.getInstance().sendCustomEvent(Events.FETCH_LOCAL_STORAGE, null);
    EventHub.getInstance().sendCustomEvent(Events.FETCH_PROJECT_KEY, null);
  }

  connect() {
    EventHub.getInstance().sendCustomEvent(Events.INITIALIZE_DATA, {
      baseURL: $baseURL?.value || "",
      clientKey: $clientKey?.value || "",
      sourceKey: $sourceKey?.value || "",
      filters: {
        projectKey: [projectKey],
      },
    });
    toggleSpinner();

    EventHub.getInstance().sendCustomEvent(Events.SET_LOCAL_STORAGE, {
      baseURL: $baseURL?.value || "",
      clientKey: $clientKey?.value || "",
      sourceKey: $sourceKey?.value || "",
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

  lastUpdatedInterval(date: Date) {
    if ($date) {
      // eslint-disable-next-line func-style
      const interval = () => {
        if ($date) {
          $date.innerText = getTimeAgo(date);
        }
      };
      // Clear any previous interval, start new interval to update time every 5 seconds
      clearInterval(timeInterval);
      interval(); // run once immediately
      timeInterval = setInterval(interval, 5000);
    }
  }
}
function toggleShowAnnotations() {
  if ($annotationToggle) {
    $annotationToggle.checked = true;
  }
}
function toggleSpinner() {
  $spinner?.classList.toggle("is-active");
  $plugin?.classList.toggle("no-pointer");
}
