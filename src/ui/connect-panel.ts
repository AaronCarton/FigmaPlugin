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
const $removeBtn: HTMLButtonElement | null = document.querySelector(".js-remove-btn");
const $createBtn: HTMLButtonElement | null = document.querySelector(".js-create-btn");

const iconCheck = "c-icon_check_class";
const isActiveField = "is-active";

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
  if ($dataSource && $entity && $attribute && $dataType && $value && $removeBtn && $createBtn) {
    $dataSource.value = message.dataSource;
    $entity.value = message.entity;
    $entity.disabled = false;
    $attribute.value = message.attribute;
    $attribute.disabled = false;
    $dataType.value = message.dataType;
    $dataType.disabled = false;
    $value.value = message.value;
    $removeBtn.disabled = false;
    $removeBtn.classList.add("button-pointer");
    $createBtn.innerText = "Update annotation";
    $createBtn.disabled = false;
    $createBtn.classList.add("button-pointer");

    changeFieldsOnInput("entity", false);
    changeFieldsOnInput("attribute", false);
    changeFieldsOnInput("dataType", false);
  } else {
    createFigmaError("Error updating fields.", 5000, true);
  }
}

function clearFields() {
  if ($dataSource && $entity && $attribute && $dataType && $value && $removeBtn && $createBtn) {
    $dataSource.value = "";
    $entity.value = "";
    $entity.disabled = true;
    $attribute.value = "";
    $attribute.disabled = true;
    $dataType.value = "";
    $dataType.disabled = true;
    $value.value = "";
    $removeBtn.disabled = true;
    $removeBtn.classList.remove("button-pointer");
    $createBtn.innerText = "Create annotation";
    $createBtn.disabled = true;
    $createBtn.classList.remove("button-pointer");

    changeFieldsOnInput("entity", true);
    changeFieldsOnInput("attribute", true);
    changeFieldsOnInput("dataType", true);
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

function disableCreate() {
  if ($dataSource && $entity && $attribute && $dataType && $value && $createBtn) {
    if (
      $dataSource.value.trim().length !== 0 &&
      $entity.value.trim().length !== 0 &&
      $attribute.value.trim().length !== 0 &&
      $dataType.value.trim().length !== 0 &&
      $value.value.trim().length !== 0
    ) {
      $createBtn.disabled = false;
      $createBtn.classList.add("button-pointer");
    } else {
      $createBtn.disabled = true;
      $createBtn.classList.remove("button-pointer");
    }
  }
}

if ($buttons && $dataSource && $entity && $attribute && $dataType && $value && $removeBtn && $createBtn) {
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
      EventHub.getInstance().sendCustomEvent(Events.UPSERT_ANNOTATION, {
        dataSource: $dataSource.value.trim(),
        entity: $entity.value.trim(),
        attribute: $attribute.value.trim(),
        dataType: $dataType.value.trim(),
        value: $value.value.trim(),
      } as IAnnotation);
    }
  });

  $createBtn.addEventListener("click", () => {
    if (
      $dataSource.value.trim().length !== 0 &&
      $entity.value.trim().length !== 0 &&
      $attribute.value.trim().length !== 0 &&
      $dataType.value.trim().length !== 0 &&
      $value.value.trim().length !== 0
    ) {
      EventHub.getInstance().sendCustomEvent(Events.UPSERT_ANNOTATION, {
        dataSource: $dataSource.value.trim(),
        entity: $entity.value.trim(),
        attribute: $attribute.value.trim(),
        dataType: $dataType.value.trim(),
        value: $value.value.trim(),
      } as IAnnotation);
    }
  });

  $removeBtn.addEventListener("click", () => {
    EventHub.getInstance().sendCustomEvent(Events.INIT_ARCHIVE_ANNOTATION, {
      dataSource: $dataSource.value.trim(),
      entity: $entity.value.trim(),
      attribute: $attribute.value.trim(),
      dataType: $dataType.value.trim(),
      value: $value.value.trim(),
    } as IAnnotation);
  });

  EventHub.getInstance().makeEvent(Events.DRAW_ANNOTATION, () => {
    $removeBtn.disabled = false;
    $removeBtn.classList.add("button-pointer");
  });

  $value.addEventListener("keyup", () => {
    disableCreate();
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
