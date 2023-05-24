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
const $value: HTMLTextAreaElement | null = document.querySelector(".js-sample-value");
const $removeBtn: HTMLButtonElement | null = document.querySelector(".js-remove-btn");
const $createBtn: HTMLButtonElement | null = document.querySelector(".js-create-btn");
const $showMore: HTMLElement | null = document.querySelector(".c-connect__show-more");
const $tabs: NodeListOf<HTMLElement> = document.querySelectorAll(".js-tab");

const iconCheck = "c-icon_check_class";
const isActiveField = "is-active";
const maxCharactersInputfield = 35;
let isShowMoreActive = false;

export class ConnectPanel extends BaseComponent {
  componentType = "ConnectPanel";

  constructor() {
    super();
  }

  initComponent(): void {
    initSelectors();
    EventHub.getInstance().makeEvent(Events.UI_UPDATE_FIELDS, (annoInput) => updateFields(annoInput));
    EventHub.getInstance().makeEvent(Events.UI_CLEAR_FIELDS, () => clearFields());
    downSizeSampleValueChangingTab();
  }
}

function initSelectors() {
  // Register click events on the buttons
  $buttons?.forEach((button) => {
    const target = button.getAttribute("data-target") || "";
    const $input = document.querySelector<HTMLInputElement>(`#${target}-input`);

    button.addEventListener("click", (event) => {
      event.preventDefault();
      button.classList.contains(iconCheck) ? addValue(target) : toggleIconCheck(target);
    });

    // Cancel the input if the user clicks outside the input field
    $input?.addEventListener("focusout", (ev) => {
      if (ev.relatedTarget === button) return; // if the click is on the icon, don't cancel
      $input.value = "";
      toggleIconCheck(target);
    });

    // Add the value if the user presses enter
    $input?.addEventListener("keyup", (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        addValue(target, false);
        $input.blur();
      }
    });
  });
}

function toggleIconCheck(target: string) {
  console.log("toggleIconCheck", target);

  const $btn = document.querySelector<HTMLElement>(`#${target}-btn`);
  const $textBlock = document.querySelector<HTMLElement>(`#${target}-text`);
  const $select = document.querySelector<HTMLSelectElement>(`#${target}-select`);
  const $input = document.querySelector<HTMLInputElement>(`#${target}-input`);

  $btn?.classList.toggle(iconCheck);
  $textBlock?.classList.toggle(isActiveField);
  $select?.classList.toggle(isActiveField);
  if (!$select?.classList.contains(isActiveField)) $input?.focus();
}

function addValue(target: string, toggleCheck = true) {
  const $input = document.querySelector<HTMLInputElement>(`#${target}-input`);
  const $select = document.querySelector<HTMLSelectElement>(`#${target}-select`);

  if ($input && $select) {
    const newOption = new Option($input.value, $input.value);
    // Make sure input isn't empty, above max characters, or a duplicate value
    if (isEmpty($input)) EventHub.getInstance().sendCustomEvent(Events.FIGMA_ERROR, "Please enter a value.");
    if (!isLessCharactersThanMax($input))
      EventHub.getInstance().sendCustomEvent(Events.FIGMA_ERROR, `The maximum length of the text is ${maxCharactersInputfield} characters.`);
    if (Array.from($select.options).some((option) => option.value === newOption.value)) return; // don't add duplicate values
    // Add the new option to the select
    newOption.selected = true;
    $select.add(newOption);
    $input.value = "";
    $select.dispatchEvent(new Event("change")); // Trigger change event to enable the following fields

    if (toggleCheck) toggleIconCheck(target);
  }
}
function downSizeSampleValueChangingTab() {
  $tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const selectedTab = tab.getAttribute("data-target");
      if (isShowMoreActive && selectedTab) {
        downSizeSampleValue(selectedTab);
      }
    });
  });
}
function checkSampleValueLength() {
  if ($value && $showMore) {
    $showMore.hidden = $value.value.length < maxCharactersInputfield;
  }
}

function isLessCharactersThanMax(inputField: HTMLInputElement) {
  return inputField.value.length <= maxCharactersInputfield;
}

function isEmpty(inputField: HTMLInputElement) {
  return inputField.value.trim().length === 0;
}

function checkFields(selectElement: HTMLInputElement, changeElement1: HTMLInputElement, disabledId: string) {
  selectElement.addEventListener("change", () => {
    const $input = document.querySelector<HTMLInputElement>(`#${disabledId}-input`);
    const $textBlock = document.querySelector<HTMLElement>(`#${disabledId}-text`);
    const $btn = document.querySelector<HTMLButtonElement>(`#${disabledId}-btn`);
    if ($input && $textBlock && $btn) {
      if (selectElement.value.trim().length !== 0) {
        changeElement1.disabled = false;
        $input.disabled = false;
        $btn.disabled = false;
        $btn.classList.remove("c-connect__cta--disabled");
        $textBlock.classList.remove("disabled");
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

    checkSampleValueLength();

    changeFieldsOnInput("entity", false);
    changeFieldsOnInput("attribute", false);
    changeFieldsOnInput("dataType", false);
  } else {
    EventHub.getInstance().sendCustomEvent(Events.FIGMA_ERROR, "Error updating fields.");
  }
}

function setSampleValueInForm(sampleValue: string) {
  if ($dataSource && $entity && $attribute && $dataType && $value) {
    $dataSource.value = "";
    $entity.value = "";
    $entity.disabled = false;
    $attribute.value = "";
    $attribute.disabled = false;
    $dataType.value = "";
    $dataType.disabled = false;
    $value.value = sampleValue;

    changeFieldsOnInput("entity", false);
    changeFieldsOnInput("attribute", false);
    changeFieldsOnInput("dataType", false);
  } else {
    EventHub.getInstance().sendCustomEvent(Events.FIGMA_ERROR, "Error updating fields.");
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

    downSizeSampleValue("connect");
    checkSampleValueLength();

    changeFieldsOnInput("entity", true);
    changeFieldsOnInput("attribute", true);
    changeFieldsOnInput("dataType", true);
  } else {
    EventHub.getInstance().sendCustomEvent(Events.FIGMA_ERROR, "Error updating fields.");
  }
}

function validateDataType() {
  const dataTypeRegex: { [key: string]: RegExp } = {
    int: /^[\d]+$/,
    float: /^[\d]*\.[\d]+$/,
    char: /^.+$/,
    string: /^[\w\s\S]+$/,
    bool: /^(true|false)+$/,
    array: /^\[.*]+$/,
    date: /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/,
    time: /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
    datetime: /^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01]) (00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/,
  };
  const dataType = $dataType?.value.trim().toLowerCase();
  const value = $value?.value.trim();

  if (dataType && value && !dataTypeRegex[dataType]?.test(value)) {
    EventHub.getInstance().sendCustomEvent(Events.FIGMA_ERROR, "Sample value does not match data type.");
    return false;
  }
  return true;
}

function changeFieldsOnInput(fieldName: string, state: boolean) {
  const $input = document.querySelector<HTMLInputElement>(`#${fieldName}-field`);
  const $textBlock = document.querySelector<HTMLElement>(`#${fieldName}-text`);
  const $btn = document.querySelector<HTMLButtonElement>(`#${fieldName}-btn`);

  if ($input && $textBlock && $btn) {
    if (state === true) {
      $input.disabled = true;
      $textBlock.classList.add("disabled");
      $btn.disabled = true;
      $btn.classList.add("c-connect__cta--disabled");
    } else {
      $input.disabled = false;
      $textBlock.classList.remove("disabled");
      $btn.disabled = false;
      $btn.classList.remove("c-connect__cta--disabled");
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
    $createBtn.innerText = "Update annotation";
  });

  $value.addEventListener("keyup", () => {
    if ($showMore) {
      $showMore.hidden = $value.value.length < maxCharactersInputfield;
    }

    disableCreate();
  });

  $showMore?.addEventListener("click", () => {
    if ($showMore) {
      $value.rows = 5;
      $showMore.hidden = true;
      isShowMoreActive = true;

      $value.classList.add("c-connect__enable-scroll");
      const tab: string = "connect";
      EventHub.getInstance().sendCustomEvent(Events.UI_SHOW_MORE, { tab, isShowMoreActive });
    }
  });

  $value.addEventListener("blur", () => {
    if ($value && $showMore && $value.value.length > maxCharactersInputfield) {
      downSizeSampleValue("connect");
    }
  });
}
EventHub.getInstance().makeEvent(Events.UI_RESET_TEXTAREA_SIZE, () => {
  downSizeSampleValue("connect");
});

EventHub.getInstance().makeEvent(Events.SET_SAMPLE_VALUE_FROM_FIGMANODE, (sampleValue: string) => {
  setSampleValueInForm(sampleValue);
});

function downSizeSampleValue(tab: string) {
  if ($value && $showMore) {
    $value.rows = 1;
    $showMore.hidden = false;
    isShowMoreActive = false;

    $value.classList.remove("c-connect__enable-scroll");
    EventHub.getInstance().sendCustomEvent(Events.UI_SHOW_MORE, { tab, isShowMoreActive });
  }
}
