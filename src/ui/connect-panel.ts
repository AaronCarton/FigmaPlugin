import { AnnotationInput } from "../interfaces/annotationInput";
import { IAnnotation } from "../interfaces/interface.annotation";
import EventHub from "../services/events/EventHub";
import { Events } from "../services/events/Events";
import { BaseComponent } from "./baseComponent";

const $buttons: NodeListOf<HTMLElement> | null = document.querySelectorAll(".js-btn");
const $dataSource: HTMLButtonElement | null = document.querySelector(".js-dataSource-trigger");
const $entity: HTMLButtonElement | null = document.querySelector(".js-entity-trigger");
const $attribute: HTMLButtonElement | null = document.querySelector(".js-attribute-trigger");
const $dataType: HTMLButtonElement | null = document.querySelector(".js-dataType-trigger");
const $value: HTMLTextAreaElement | null = document.querySelector(".js-sample-value");
const $removeBtn: HTMLButtonElement | null = document.querySelector(".js-remove-btn");
const $createBtn: HTMLButtonElement | null = document.querySelector(".js-create-btn");
const $showMore: HTMLElement | null = document.querySelector(".c-connect__show-more");
const $tabs: NodeListOf<HTMLElement> = document.querySelectorAll(".js-tab");

// const $dropDownItems: NodeListOf<HTMLButtonElement> | null = document.querySelectorAll(".js-dropdown-item");
const $searchBoxes: NodeListOf<HTMLInputElement> | null = document.querySelectorAll(".js-search");
const $propertyTriggers: NodeListOf<HTMLButtonElement> | null = document.querySelectorAll(".js-select");

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
    initDropdownSearch();
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

function initDropdownSearch() {
  toggleDropdown();
  searchInDropdown();

  clickOutside("dataSource");
  clickOutside("entity");
  clickOutside("attribute");
  clickOutside("dataType");
}

function toggleDropdown() {
  if ($propertyTriggers) {
    $propertyTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const $dataTarget: string | null = trigger.getAttribute("data-target");
        const $dropDownTarget: HTMLElement | null = document.querySelector(`#${$dataTarget}-dropdown`);
        const $searchTarget: HTMLInputElement | null = document.querySelector(`#${$dataTarget}-search`);
        $dropDownTarget?.classList.toggle("show");
        $searchTarget?.focus();
        if ($dataTarget) {
          listenToDropdownItems($dataTarget);
        }
      });
    });
  }
}

function searchInDropdown() {
  if ($searchBoxes) {
    $searchBoxes.forEach((searchBox) => {
      searchBox.addEventListener("keyup", () => {
        const $dataTarget: string | null = searchBox.getAttribute("data-target");
        const $dropDownTargetItems: NodeListOf<HTMLButtonElement> | null = document.querySelectorAll(`.js-dropdown-${$dataTarget}-item`);
        $dropDownTargetItems?.forEach((item) => {
          if (item.value.toUpperCase().indexOf(searchBox.value.toUpperCase()) > -1) {
            item.style.display = "block";
          } else {
            item.style.display = "none";
          }
        });
      });
    });
  }
}

function clickOutside(target: string) {
  const $area: HTMLElement | null = document.querySelector(`.js-dropdown-${target}-area`);
  const $panel: HTMLButtonElement | null = document.querySelector(`#${target}-dropdown`);

  document.addEventListener("click", (event: any) => {
    if ($area && $panel) {
      const isClickedInside = $area.contains(event.target);
      if (!isClickedInside) {
        $panel.classList.remove("show");
      }
    }
  });
}

function listenToDropdownItems(target: string) {
  const $dropDownItems: NodeListOf<HTMLButtonElement> | null = document.querySelectorAll(`.js-dropdown-${target}-item`);

  $dropDownItems.forEach((item) => {
    item.addEventListener("click", () => {
      const $dataTarget: string | null = item.getAttribute("data-target");
      const $targetSelect: HTMLButtonElement | null = document.querySelector(`#${$dataTarget}-select`);
      const $dropDownTarget: HTMLButtonElement | null = document.querySelector(`#${$dataTarget}-dropdown`);
      if ($targetSelect && $dropDownTarget) {
        $targetSelect.innerHTML = item.innerHTML;
        $targetSelect.value = item.value;
        $dropDownTarget.classList.remove("show");
      }
    });
  });
}

function toggleIconCheck(target: string) {
  console.log("Check");
  const $btn = document.querySelector<HTMLElement>(`#${target}-btn`);
  const $textBlock = document.querySelector<HTMLElement>(`#${target}-text`);
  const $select = document.querySelector<HTMLElement>(`.js-dropdown-${target}-area`);
  const $input = document.querySelector<HTMLInputElement>(`#${target}-input`);

  $btn?.classList.toggle(iconCheck);
  $textBlock?.classList.toggle(isActiveField);
  $select?.classList.toggle(isActiveField);
  if (!$select?.classList.contains(isActiveField)) $input?.focus();
}

function addValue(target: string, toggleCheck = true) {
  const $input = document.querySelector<HTMLInputElement>(`#${target}-input`);
  const $select = document.querySelector<HTMLSelectElement>(`#${target}-dropdown`);
  console.log(target);
  const $targetSelect: HTMLButtonElement | null = document.querySelector(`#${target}-select`);

  if ($input && $select) {
    if (!isEmpty($input)) {
      if (!checkIfItemAlreadyExists(target, $input.value)) {
        if (!isLessCharactersThanMax($input)) {
          EventHub.getInstance().sendCustomEvent(Events.FIGMA_ERROR, `The maximum length of the text is ${maxCharactersInputfield} characters.`);
        }
        addOptionToDropdown(target, $input, $select, $targetSelect);
      }

      if ($targetSelect) {
        $targetSelect.innerHTML = $input.value;
        $targetSelect.value = $input.value;
      }
      $input.value = "";
      if (toggleCheck) toggleIconCheck(target);
    } else {
      EventHub.getInstance().sendCustomEvent(Events.FIGMA_ERROR, "Please enter a value.");
    }
  }
}

function addOptionToDropdown(target: string, $input: HTMLInputElement, $select: HTMLSelectElement, $targetSelect: HTMLButtonElement | null) {
  const newOption = document.createElement("button");
  newOption.classList.add("a-dropdown-item", "js-dropdown-item", `js-dropdown-${target}-item`);
  newOption.value = $input.value;
  newOption.setAttribute("data-target", `${target}`);
  newOption.innerHTML = $input.value;
  newOption.disabled = false;
  $select.appendChild(newOption);
  $targetSelect?.dispatchEvent(new Event("change"));
}

function checkIfItemAlreadyExists(target: string, value: string) {
  const $targetDropdown = document.querySelector<HTMLSelectElement>(`#${target}-dropdown`);
  if ($targetDropdown) {
    for (const childNode of $targetDropdown.childNodes) {
      if (childNode.nodeType === Node.ELEMENT_NODE) {
        const button = childNode as HTMLButtonElement;
        if (button.tagName === "BUTTON" && button.textContent === value) {
          return true;
        }
      }
    }
    return false;
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

function checkFields(selectElement: HTMLButtonElement, changeElement1: HTMLButtonElement, disabledId: string) {
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
    $dataSource.innerHTML = message.dataSource;
    $entity.value = message.entity;
    $entity.innerHTML = message.entity;
    $entity.disabled = false;
    $attribute.value = message.attribute;
    $attribute.innerHTML = message.attribute;
    $attribute.disabled = false;
    $dataType.value = message.dataType;
    $dataType.innerHTML = message.dataType;
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
    $dataSource.innerHTML = "Choose source";
    $entity.value = "";
    $entity.innerHTML = "Choose entity";
    $entity.disabled = true;
    $attribute.value = "";
    $attribute.innerHTML = "Choose attribute";
    $attribute.disabled = true;
    $dataType.value = "";
    $dataType.innerHTML = "Choose type";
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
  const $input = document.querySelector<HTMLInputElement>(`#${fieldName}-input`);
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
      if ($value.value.length > maxCharactersInputfield) {
        $showMore.hidden = false;
      } else {
        $showMore.hidden = true;
        $value.classList.remove("c-connect__enable-scroll");
        isShowMoreActive = false;
        const tab: string = "connect";
        EventHub.getInstance().sendCustomEvent(Events.UI_SHOW_MORE, { tab, isShowMoreActive });
      }
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
