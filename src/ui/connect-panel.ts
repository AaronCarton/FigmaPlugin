import { MessageTitle } from "../classes/messageTitles";
import { createFigmaError } from "../functions/createError";
import { AnnotationInput } from "../interfaces/annotationInput";
import ApiClient from "../services/api/client";
import EventHub from "../services/events/EventHub";
import { Events } from "../services/events/Events";
import { BaseComponent } from "./baseComponent";

const buttons: NodeListOf<HTMLElement> | null = document.querySelectorAll(".js-btn");
const dataSrc: HTMLInputElement | null = document.querySelector(".js-data-source");
const entity: HTMLInputElement | null = document.querySelector(".js-entity");
const attribute: HTMLInputElement | null = document.querySelector(".js-attribute");
const dataType: HTMLInputElement | null = document.querySelector(".js-data-type");
const sampleValue: HTMLInputElement | null = document.querySelector(".js-sample-value");

const iconCheck = "c-icon_check_class";
const isActiveField = "is-active";

export class ConnectPanel extends BaseComponent {
  componentType = "ConnectPanel";

  constructor() {
    super();
  }

  initComponent(): void {}
}

function handleIconClick(trigger: HTMLElement) {
  const selectedAttribute = trigger.getAttribute("data-target");
  const inputSelect = document.querySelector<HTMLSelectElement>(`#${selectedAttribute}-select`);
  const inputText = document.querySelector<HTMLElement>(`#${selectedAttribute}-text`);
  const inputField = document.querySelector<HTMLInputElement>(`#${selectedAttribute}-field`);

  if (selectedAttribute && inputSelect && inputText && inputField) {
    const newOption = new Option(inputField.value, inputField.value);
    if (!Array.from(inputSelect.options).some((option) => option.value === newOption.value)) {
      inputSelect.add(newOption);
    }
    inputSelect.value = inputField.value;
    inputSelect.dispatchEvent(new Event("change"));

    trigger.classList.toggle(iconCheck);
    inputText.classList.toggle(isActiveField);
    inputSelect.classList.toggle(isActiveField);
  }
}

function checkFields(
  selectElement: HTMLInputElement,
  changeElement1: HTMLInputElement,
  disabledId: string,
) {
  selectElement.addEventListener("change", () => {
    const textField = document.querySelector<HTMLInputElement>(`#${disabledId}-field`);
    const textArea = document.querySelector<HTMLElement>(`#${disabledId}-text`);
    if (textField && textArea) {
      if (selectElement.value.trim().length !== 0) {
        changeElement1.disabled = false;
        textField.disabled = false;
        textArea.classList.remove("disabled");
      }
    }
  });
}

function updateFields(message: AnnotationInput) {
  if (dataSrc && entity && attribute && dataType && sampleValue) {
    dataSrc.value = message.dataSrc;
    entity.value = message.entity;
    entity.disabled = false;
    attribute.value = message.attribute;
    attribute.disabled = false;
    dataType.value = message.dataType;
    dataType.disabled = false;
    sampleValue.value = message.sampleValue;

    changeFieldsOnInput("entity", false);
    changeFieldsOnInput("attribute", false);
    changeFieldsOnInput("data-type", false);
  } else {
    createFigmaError("Error updating fields.", 5000, true);
  }
}

function clearFields() {
  if (dataSrc && entity && attribute && dataType && sampleValue) {
    dataSrc.value = "";
    entity.value = "";
    entity.disabled = true;
    attribute.value = "";
    attribute.disabled = true;
    dataType.value = "";
    dataType.disabled = true;
    sampleValue.value = "";

    changeFieldsOnInput("entity", true);
    changeFieldsOnInput("attribute", true);
    changeFieldsOnInput("data-type", true);
  } else {
    createFigmaError("Error clearing fields.", 5000, true);
  }
}

function changeFieldsOnInput(fieldName: string, state: boolean) {
  const textField = document.querySelector<HTMLInputElement>(`#${fieldName}-field`);
  const textArea = document.querySelector<HTMLElement>(`#${fieldName}-text`);

  if (textField && textArea) {
    if (state === true) {
      textField.disabled = true;
      textArea.classList.add("disabled");
    } else {
      textField.disabled = false;
      textArea.classList.remove("disabled");
    }
  }
}

if (buttons && dataSrc && entity && attribute && dataType && sampleValue) {
  buttons.forEach((icon) => {
    icon.addEventListener("click", () => {
      handleIconClick(icon);
    });
  });

  checkFields(dataSrc, entity, "entity");
  checkFields(entity, attribute, "attribute");
  checkFields(attribute, dataType, "data-type");

  sampleValue.addEventListener("keyup", (event: KeyboardEvent) => {
    if (
      event.key === "Enter" &&
      dataSrc.value.trim().length !== 0 &&
      entity.value.trim().length !== 0 &&
      attribute.value.trim().length !== 0 &&
      dataType.value.trim().length !== 0 &&
      sampleValue.value.trim().length !== 0
    ) {
      parent.postMessage(
        {
          pluginMessage: {
            type: "createText",
            payload: {
              values: {
                dataSrc: dataSrc.value.trim(),
                entity: entity.value.trim(),
                attribute: attribute.value.trim(),
                dataType: dataType.value.trim(),
                sampleValue: sampleValue.value.trim(),
              },
            },
          },
        },
        "*",
      );
    }
  });
}

window.addEventListener("message", (e) => {
  const messageType = e.data.pluginMessage.type;
  const payload = e.data.pluginMessage.payload;

  switch (messageType) {
    case MessageTitle.updateFields:
      updateFields(payload.values);
      break;

    case MessageTitle.clearFields:
      clearFields();
      break;

    default:
      break;
  }
});
