import ApiClient from "../services/api/client";
import { EventHub } from "../services/events/EventHub";

const buttons: NodeListOf<HTMLElement> = document.querySelectorAll(".js-btn");

const $iconCheck = "c-icon_check_class";
const $isActiveField = "is-active";

// select elements
const $inputDataSource: HTMLInputElement | null = document.querySelector("#data-source-select");
const $inputEntity: HTMLInputElement | null = document.querySelector("#entity-select");
const $inputAttribute: HTMLInputElement | null = document.querySelector("#attribute-select");
const $inputDatatype: HTMLInputElement | null = document.querySelector("#data-type-select");
const $inputValue: HTMLInputElement | null = document.querySelector("#js-sample-value");

// input elements
const dataSrc: HTMLInputElement = document.querySelector(".js-data-source")!;
const entity: HTMLInputElement = document.querySelector(".js-entity")!;
const attribute: HTMLInputElement = document.querySelector(".js-attribute")!;
const dataType: HTMLInputElement = document.querySelector(".js-data-type")!;
const sampleValue: HTMLInputElement = document.querySelector(".js-sample-value")!;

const eventHub = new EventHub();
const api = new ApiClient();
const iconCheck = "c-icon--check";
const isActiveField = "is-active";
let counter = 0;
let exist = false;

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

function buttonTrigger(trigger: HTMLElement) {
  const selectedButton = trigger.getAttribute("data-target")!;
  const inputSelect: HTMLSelectElement = document.querySelector(`#${selectedButton}-select`)!;
  const inputText: HTMLElement = document.querySelector(`#${selectedButton}-text`)!;
  const inputField: HTMLInputElement = document.querySelector(`#${selectedButton}-field`)!;

  if (counter === 0) {
    counter++;
  } else {
    const newOption = document.createElement("option");
    newOption.value = inputField.value;
    newOption.textContent = inputField.value;
    for (let i = 0; i < inputSelect.options.length; i++) {
      if (inputSelect.options[i].value === newOption.value) {
        exist = true;
        break;
      }
    }

    if (exist) {
      exist = false;
    } else {
      inputSelect.appendChild(newOption);
    }

    inputSelect.value = inputField.value;
    counter--;
  }

  trigger.classList.toggle(iconCheck);
  inputText.classList.toggle(isActiveField);
  inputSelect.classList.toggle(isActiveField);
}

sampleValue.addEventListener("keyup", (event: KeyboardEvent) => {
  if (
    event.key === "Enter" &&
    dataSrc.value !== "" &&
    entity.value !== "" &&
    attribute.value !== "" &&
    dataType.value !== "" &&
    sampleValue.value !== ""
  ) {
    parent.postMessage(
      {
        pluginMessage: {
          type: "createText",
          values: [dataSrc.value, entity.value, attribute.value, dataType.value, sampleValue.value],
        },
      },
      "*",
    );
  }
});

function toggleFields(button: HTMLElement) {
  const selectedButton = button.getAttribute("data-target");
  button.classList.toggle($iconCheck);
  document.getElementById(`${selectedButton}-text`)?.classList.toggle($isActiveField);
  document.getElementById(`${selectedButton}-select`)?.classList.toggle($isActiveField);
}

buttons.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    buttonTrigger(trigger);
    eventHub.sendCustomEvent(eventHub.update_annotation, "update_annotation");
  });
});

function initConnect() {
  initializeEvents();
}

initConnect();
