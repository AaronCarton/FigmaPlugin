import { MessageTitle } from "../classes/messageTitles";
import { createFigmaError } from "../functions/createError";
import { AnnotationInput } from "../interfaces/annotationInput";
import { IAnnotation } from "../interfaces/interface.annotation";
import EventHub from "../services/events/EventHub";
import { Events } from "../services/events/Events";
import { BaseComponent } from "./baseComponent";

const $buttons: NodeListOf<HTMLElement> | null = document.querySelectorAll(".js-btn");
const $dataSource: HTMLInputElement | null = document.querySelector(".js-dataSource");
const $entity: HTMLInputElement | null = document.querySelector(".js-entity");
const $attribute: HTMLInputElement | null = document.querySelector(".js-attribute");
const $dataType: HTMLInputElement | null = document.querySelector(".js-dataType");
const $value: HTMLInputElement | null = document.querySelector(".js-sample-value");

const iconCheck = "c-icon_check_class";
const isActiveField = "is-active";
const maxCharactersInputfield = 5;

export class ConnectPanel extends BaseComponent {
  componentType = "ConnectPanel";

  constructor() {
    super();
  }

  initComponent(): void {
    console.log("ConnectPanel initialized.");
  }
}

function handleIconClick(trigger: HTMLElement) {
  const selectedAttribute = trigger.getAttribute("data-target");
  const inputSelect = document.querySelector<HTMLSelectElement>(`#${selectedAttribute}-select`);
  const inputText = document.querySelector<HTMLElement>(`#${selectedAttribute}-text`);
  const inputField = document.querySelector<HTMLInputElement>(`#${selectedAttribute}-field`);

  if (selectedAttribute && inputSelect && inputText && inputField) {
    if (isEmpty(inputField)) {
      if (isLessCharactersThanMax(inputField)) {
        const newOption = new Option(inputField.value, inputField.value);
        if (!Array.from(inputSelect.options).some((option) => option.value === newOption.value)) {
          console.log("Check: ", inputField.value);
          inputSelect.add(newOption);
        }
        inputSelect.value = inputField.value;
        inputSelect.dispatchEvent(new Event("change"));
      } else {
        EventHub.getInstance().sendCustomEvent(Events.FIGMA_ERROR, "The maximum length of the text is 35 characters.");
      }
    }

    trigger.classList.toggle(iconCheck);
    inputText.classList.toggle(isActiveField);
    inputSelect.classList.toggle(isActiveField);
  }
}

function isLessCharactersThanMax(inputField: HTMLInputElement) {
  return inputField.value.length <= maxCharactersInputfield;
}

function isEmpty(inputField: HTMLInputElement) {
  return inputField.value.trim().length !== 0;
}

function checkFields(selectElement: HTMLInputElement, changeElement1: HTMLInputElement, disabledId: string) {
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
  if ($dataSource && $entity && $attribute && $dataType && $value) {
    $dataSource.value = message.dataSource;
    $entity.value = message.entity;
    $entity.disabled = false;
    $attribute.value = message.attribute;
    $attribute.disabled = false;
    $dataType.value = message.dataType;
    $dataType.disabled = false;
    $value.value = message.value;

    changeFieldsOnInput("entity", false);
    changeFieldsOnInput("attribute", false);
    changeFieldsOnInput("dataType", false);
  } else {
    createFigmaError("Error updating fields.", 5000, true);
  }
}

function clearFields() {
  if ($dataSource && $entity && $attribute && $dataType && $value) {
    $dataSource.value = "";
    $entity.value = "";
    $entity.disabled = true;
    $attribute.value = "";
    $attribute.disabled = true;
    $dataType.value = "";
    $dataType.disabled = true;
    $value.value = "";

    changeFieldsOnInput("entity", true);
    changeFieldsOnInput("attribute", true);
    changeFieldsOnInput("dataType", true);
  } else {
    createFigmaError("Error clearing fields.", 5000, true);
  }
}

function validateDataType() {
  const dataTypeRegex: { [key: string]: RegExp } = {
    string: /^[\w\s]+$/,
    number: /^[\d]+$/,
    int: /^[\d]+$/,
  };
  const dataType = $dataType?.value.trim().toLowerCase();
  const value = $value?.value.trim();

  if (dataType && value && !dataTypeRegex[dataType]?.test(value)) {
    console.error("Sample value does not match data type.");
    EventHub.getInstance().sendCustomEvent(Events.FIGMA_ERROR, "Sample value does not match data type.");
    return false;
  }
  return true;
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

if ($buttons && $dataSource && $entity && $attribute && $dataType && $value) {
  $buttons.forEach((icon) => {
    icon.addEventListener("click", () => {
      handleIconClick(icon);
    });
  });

  checkFields($dataSource, $entity, "entity");
  checkFields($entity, $attribute, "attribute");
  checkFields($attribute, $dataType, "dataType");

  $value.addEventListener("keyup", (event: KeyboardEvent) => {
    if (
      event.key === "Enter" &&
      $dataSource.value.trim().length !== 0 &&
      $entity.value.trim().length !== 0 &&
      $attribute.value.trim().length !== 0 &&
      $dataType.value.trim().length !== 0 &&
      $value.value.trim().length !== 0
    ) {
      // Validate is sample value matches data type first
      if (!validateDataType()) return;

      EventHub.getInstance().sendCustomEvent(Events.UPSERT_ANNOTATION, {
        dataSource: $dataSource.value.trim(),
        entity: $entity.value.trim(),
        attribute: $attribute.value.trim(),
        dataType: $dataType.value.trim(),
        value: $value.value.trim(),
      } as IAnnotation);
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
