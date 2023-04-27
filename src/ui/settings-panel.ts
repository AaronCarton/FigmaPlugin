import Annotation from "../interfaces/interface.annotation";
import ApiClient from "../services/api/client";
import EventHub from "../services/events/EventHub";
import { Events } from "../services/events/Events";
import { BaseComponent } from "./baseComponent";

//input elements
const $baseURL: HTMLInputElement | null = document.querySelector("#settings_dbLink");
const $clientKey: HTMLInputElement | null = document.querySelector("#settings_clientKey");
const $sourceKey: HTMLInputElement | null = document.querySelector("#settings_sourceKey");
const $projectKey: HTMLInputElement | null = document.querySelector("#settings_projectKey"); // TODO: remove this when integrated with the plugin
const $annotationToggle: HTMLInputElement | null = document.querySelector("#annotationToggle");
const $button: HTMLButtonElement | null = document.querySelector(".c-settings__btnConnect");
//Spinner
const $spinner: HTMLElement | null = document.querySelector(".c-settings__loader");
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
    EventHub.getInstance().makeEvent(
      Events.LOCAL_STORAGE_FETCHED,
      ({ baseURL, clientKey, sourceKey }) => {
        $baseURL?.setAttribute("value", baseURL);
        $clientKey?.setAttribute("value", clientKey);
        $sourceKey?.setAttribute("value", sourceKey);
        this.disableFieldsWhenNecessary();

        // TODO: emit event to initialize data right away, because we got the values from localStorage
        // EventHub.getInstance().sendCustomEvent(Events.INITIALIZE_DATA, {
        //   $projectKey: $projectKey?.value,
        //   baseURL,
        //   clientKey,
        //   sourceKey,
        // });
      },
    );
    EventHub.getInstance().sendCustomEvent(Events.FETCH_LOCAL_STORAGE, {});
  }

  connect() {
    EventHub.getInstance().sendCustomEvent(Events.INITIALIZE_DATA, {
      projectKey: $projectKey?.value,
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

  checkConnectionSpinnerExample() {
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

  toggleAnnotations(e: Event) {
    const state: boolean = (<HTMLInputElement>e.target).checked;
    if (state === true) {
      console.log("Show annotations.");
      parent.postMessage(
        {
          pluginMessage: {
            type: "changeVisibility",
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
            type: "changeVisibility",
            payload: { state: state },
          },
        },
        "*",
      );
    }
  }

  disableFieldsWhenNecessary() {
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
      if (
        $baseURL.value.replace(/\s/g, "") !== "" &&
        $sourceKey.value.replace(/\s/g, "") !== "" &&
        $clientKey.value.replace(/\s/g, "") !== ""
      ) {
        console.log("enable button");
        $annotationToggle.disabled = false;
        $button.addEventListener("click", this.checkConnectionSpinnerExample);
      }
    } else {
      $annotationToggle.disabled = true;
      $button.removeEventListener("click", this.checkConnectionSpinnerExample);
    }
  }

  initAnnotationToggleEvents() {
    $annotationToggle?.addEventListener("click", this.toggleAnnotations);
    $baseURL?.addEventListener("keyup", this.disableFieldsWhenNecessary);
    $clientKey?.addEventListener("keyup", this.disableFieldsWhenNecessary);
    $sourceKey?.addEventListener("keyup", this.disableFieldsWhenNecessary);
  }
}