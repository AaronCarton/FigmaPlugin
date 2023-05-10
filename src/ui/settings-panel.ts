import { MessageTitle } from "../classes/messageTitles";
import Annotation from "../interfaces/interface.annotation";
import { ODSFacet } from "../interfaces/ods/interface.ODSresponse";
import ApiClient from "../services/api/client";
import EventHub from "../services/events/EventHub";
import { Events } from "../services/events/Events";
import { BaseComponent } from "./baseComponent";
import { changeConnectionState } from "./navigation-tabs";

//input elements
const $baseURL: HTMLInputElement | null = document.querySelector("#settings_dbLink");
const $clientKey: HTMLInputElement | null = document.querySelector("#settings_clientKey");
const $sourceKey: HTMLInputElement | null = document.querySelector("#settings_sourceKey");
const $annotationToggle: HTMLInputElement | null = document.querySelector("#annotationToggle");
let projectKey: string = "";
export const $button: HTMLButtonElement | null = document.querySelector(".c-settings__btnConnect");
export const $date: HTMLElement | null = document.querySelector(".c-settings__date");
//Spinner
const $spinner: HTMLElement | null = document.querySelector(".c-settings-update");
const $plugin: HTMLElement | null = document.querySelector(".js-settings-view");

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
    });
  }

  initializeEventHubEvents() {
    ApiClient.initializeEvents();
    EventHub.getInstance().makeEvent(Events.ANNOTATIONS_FETCHED, (annotations: Annotation[]) => {
      console.log("Annotations fetched: ", annotations, ".");

      if ($button && $date) {
        const now = new Date().toLocaleString("en-GB").replace(",", "");
        $button.innerHTML = "Refresh";
        $date.innerHTML = now;
      }

      changeConnectionState(true);
    });
    EventHub.getInstance().makeEvent(Events.FACETS_FETCHED, (facets: ODSFacet[]) => {
      const data = Object.fromEntries(facets.map((f) => [f.name, f.values.map((v) => v.value)]));
      Object.keys(data).forEach((key) => {
        this.loadDropdowns(key, data[key]);
      });
    });

    EventHub.getInstance().makeEvent(Events.LOCAL_STORAGE_FETCHED, ({ baseURL, clientKey, sourceKey }) => {
      $baseURL?.setAttribute("value", baseURL || "");
      $clientKey?.setAttribute("value", clientKey || "");
      $sourceKey?.setAttribute("value", sourceKey || "");
      this.disableFieldsWhenNecessary();
    });

    EventHub.getInstance().makeEvent(Events.PROJECT_KEY_FETCHED, (pk) => {
      projectKey = pk;
    });

    EventHub.getInstance().sendCustomEvent(Events.FETCH_LOCAL_STORAGE, {});
    EventHub.getInstance().sendCustomEvent(Events.FETCH_PROJECT_KEY, {});
  }

  connect() {
    EventHub.getInstance().sendCustomEvent(Events.INITIALIZE_DATA, {
      projectKey: projectKey,
      baseURL: $baseURL?.value,
      clientKey: $clientKey?.value,
      sourceKey: $sourceKey?.value,
    });
    EventHub.getInstance().sendCustomEvent(Events.SET_LOCAL_STORAGE, {
      baseURL: $baseURL?.value,
      clientKey: $clientKey?.value,
      sourceKey: $sourceKey?.value,
    });
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
      $dropDown.add(defaultOption);
    }
    data.forEach((element) => {
      const newOption = new Option(element, element);
      $dropDown?.add(newOption);
    });
  }

  checkConnectionSpinnerExample() {
    $plugin?.classList.add("no-pointer");
    $spinner?.removeAttribute("hidden");

    fetch("https://www.mocky.io/v2/5185415ba171ea3a00704eed?mocky-delay=5000ms")
      .then((response) => response.json())
      .then(() => {
        $plugin?.classList.remove("no-pointer");
        $spinner?.setAttribute("hidden", "");
      });
  }

  toggleAnnotations(e: Event) {
    const state: boolean = (<HTMLInputElement>e.target).checked;
    if (state === true) {
      console.log("Show annotations.");
      parent.postMessage(
        {
          pluginMessage: {
            type: MessageTitle.changeVisibility,
            payload: { state: state },
          },
        },
        "*",
      );
    } else {
      console.log("Hide annotations.");
      parent.postMessage(
        {
          pluginMessage: {
            type: MessageTitle.changeVisibility,
            payload: { state: state },
          },
        },
        "*",
      );
    }
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
        console.log("enable button");
        $annotationToggle.disabled = false;
        $button.disabled = false;
        $button.classList.add("button-pointer");
        $button.addEventListener("click", this.checkConnectionSpinnerExample);
      } else {
        $annotationToggle.disabled = true;
        $button.disabled = true;
        $button.classList.remove("button-pointer");
        $button.removeEventListener("click", this.checkConnectionSpinnerExample);
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
