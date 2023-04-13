import ApiClient from "../services/api/client";
import { EventHub } from "../services/events/EventHub";

const buttons: NodeListOf<HTMLElement> = document.querySelectorAll(".js-btn");

const $iconCheck = "c-icon_check_class";
const $isActiveField = "is-active";

// input elements
const $inputDataSource: HTMLInputElement | null = document.querySelector("#data-source-select");
const $inputEntity: HTMLInputElement | null = document.querySelector("#entity-select");
const $inputAttribute: HTMLInputElement | null = document.querySelector("#attribute-select");
const $inputDatatype: HTMLInputElement | null = document.querySelector("#data-type-select");
const $inputValue: HTMLInputElement | null = document.querySelector("#js-sample-value");

const eventHub = new EventHub();
const api = new ApiClient();

function initializeEvents() {
  eventHub.makeEvent(eventHub.update_annotation, () => {
    const body = {
      projectKey: "19123591", // TODO: get projectKey from the current project.
      nodeId: "cec66bdf",
      dataSource: $inputDataSource?.value,
      entity: $inputEntity?.value,
      attribute: $inputAttribute?.value,
      dataType: $inputDatatype?.value,
      value: $inputValue?.value,
    } as any;
    console.log(
      $inputDataSource?.value,
      $inputEntity?.value,
      $inputAttribute?.value,
      $inputDatatype?.value,
      $inputValue?.value,
    );
    api.upsertItem("annotation", "3414883772", body);
    console.log(body);
  });
}

function toggleFields(button: HTMLElement) {
  const selectedButton = button.getAttribute("data-target");
  button.classList.toggle($iconCheck);
  document.getElementById(`${selectedButton}-text`)?.classList.toggle($isActiveField);
  document.getElementById(`${selectedButton}-select`)?.classList.toggle($isActiveField);
}

buttons.forEach(function (trigger) {
  trigger.addEventListener("click", function () {
    toggleFields(trigger);
    eventHub.sendCustomEvent(eventHub.update_annotation, "update_annotation");
  });
});

function initConnect() {
  initializeEvents();
}

initConnect();
