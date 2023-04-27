import { FigmaLocalStorage } from "./figmaLocalStorage";
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
const $button: HTMLButtonElement | null = document.querySelector(".c-plugin__btnConnect");
//Spinner
const $spinner: HTMLElement | null = document.querySelector(".c-plugin__loader");
const $plugin: HTMLElement | null = document.querySelector(".js-settings-view");
//Settings tab
const settingsTab: HTMLElement | null = document.querySelector(".a-settings-tab");
//Initialize local storage
const figmaLocalStorage = new FigmaLocalStorage();

function initializeEventHubEvents() {
  ApiClient.initializeEvents();
}

function connect() {
  $button?.addEventListener("click", (e: Event) => {
    e.preventDefault();
    EventHub.getInstance().sendCustomEvent(Events.INITIALIZE_DATA, {
      projectKey: $projectKey?.value,
      baseURL: $baseURL?.value,
      clientKey: $clientKey?.value,
      sourceKey: $sourceKey?.value,
    });

    // setTimeout(() => {
    //   ApiClient.getInstance()
    //     .getAnnotations("195")
    //     .then((e: Annotation[]) => {
    //       const a = e.find((a) => (a.attribute = "body"));
    //       if (a) {
    //         a.value = `A bunch of text that fills up a body... ${new Date().toISOString()}`;
    //         EventHub.getInstance().sendCustomEvent(Events.UPDATE_ANNOTATION, a);
    //       }
    //     });
    // }, 3000);
  });
}

export class Settings extends BaseComponent {
  componentType = "Settings";

  constructor() {
    super();
  }

  initComponent(): void {
    initializeEventHubEvents();
    this.disableFieldsWhenNecessary();
    this.initAnnotationToggleEvents();
    this.loadKeysFromLocalStorage();
    connect();
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
      console.log("show annotations");
    } else {
      console.log("hide annotations");
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

  fillBaseUrlInInputfields(baseURL: string) {
    if (settingsTab !== null) {
      settingsTab.addEventListener("click", () => {
        // do something when the settings tab is clicked
        $baseURL?.setAttribute("value", baseURL);
      });
    }
  }

  fillClientKeyInInputfields(clientKey: string) {
    if (settingsTab !== null) {
      settingsTab.addEventListener("click", () => {
        // do something when the settings tab is clicked
        $clientKey?.setAttribute("value", clientKey);
      });
    }
  }

  fillSourceKeyInInputfields(sourceKey: string) {
    if (settingsTab !== null) {
      settingsTab.addEventListener("click", () => {
        // do something when the settings tab is clicked
        $sourceKey?.setAttribute("value", sourceKey);
      });
    }
  }

  // fillKeysInInputfields(baseURL: string, clientKey: string, sourceKey: string) {
  //   if (settingsTab !== null) {
  //     settingsTab.addEventListener("click", () => {
  //       // do something when the settings tab is clicked
  //       $baseURL?.setAttribute("value", baseURL);
  //       $clientKey?.setAttribute("value", clientKey);
  //       $sourceKey?.setAttribute("value", sourceKey);
  //     });
  //   }
  // }

  connect() {
    const baseURL = $baseURL?.value;
    const clientKey = $clientKey?.value;
    const sourceKey = $sourceKey?.value;

    // Still needs a way to check if the entered keys are actually conntected to the right db
    figmaLocalStorage.sendKeysToLocalStorage(baseURL, clientKey, sourceKey);
  }

  loadKeysFromLocalStorage() {
    if ($baseURL !== null) {
      this.fillBaseUrlInInputfields(figmaLocalStorage.getBaseURLFromFigmaStorage() as string);
    }

    // figmaLocalStorage.getClientKeyFromFigmaStorage().then((clientKey) => {
    //   if (clientKey !== null) {
    //     fillClientKeyInInputfields(clientKey);
    //   }
    // });
    // figmaLocalStorage.getSourceKeyFromFigmaStorage().then((sourceKey) => {
    //   if (sourceKey !== null) {
    //     fillSourceKeyInInputfields(sourceKey);
    //   }
    // });
    if ($button !== null) {
      $button.addEventListener("click", this.connect);
    }
  }
}
