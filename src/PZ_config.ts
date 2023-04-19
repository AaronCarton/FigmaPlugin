import ApiClient from "./services/api/client";
import EventHub from "../src/services/events/EventHub.js";
import { Events } from "../src/services/events/Events";

const $baseURL: HTMLInputElement | null = document.querySelector("#settings_dbLink");
const $clientKey: HTMLInputElement | null = document.querySelector("#settings_clientKey");
const $sourceKey: HTMLInputElement | null = document.querySelector("#settings_sourceKey");
const $button: HTMLButtonElement | null = document.querySelector(".c-plugin__btnConnect");

export const eventHub = new EventHub();

export const apiClient = new ApiClient();

eventHub.makeEvent(Events.INITIALIZE_DATA, () => {
  ApiClient.initialize({
    baseURL: $baseURL?.value,
    clientKey: $clientKey?.value,
    sourceKey: $sourceKey?.value,
  });
});

function connect() {
  $button?.addEventListener("click", (e: Event) => {
    e.preventDefault();
    eventHub.sendCustomEvent(Events.INITIALIZE_DATA, "initialize data");
  });
}

connect();
