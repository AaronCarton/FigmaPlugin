import ApiClient from "../services/api/client";
import EventHub from "../services/events/EventHub";
import { Events } from "../services/events/Events";
import { BaseComponent } from "./baseComponent";

const buttons: NodeListOf<HTMLElement> = document.querySelectorAll(".js-btn");
const dataSrc: HTMLInputElement | null = document.querySelector(".js-data-source");
const entity: HTMLInputElement | null = document.querySelector(".js-entity");
const attribute: HTMLInputElement | null = document.querySelector(".js-attribute");
const dataType: HTMLInputElement | null = document.querySelector(".js-data-type");
const sampleValue: HTMLInputElement | null = document.querySelector(".js-sample-value");

// select elements
const $inputDataSource: HTMLInputElement | null = document.querySelector("#data-source-select");
const $inputEntity: HTMLInputElement | null = document.querySelector("#entity-select");
const $inputAttribute: HTMLInputElement | null = document.querySelector("#attribute-select");
const $inputDatatype: HTMLInputElement | null = document.querySelector("#data-type-select");
const $inputValue: HTMLInputElement | null = document.querySelector("#js-sample-value");
const $projectKey: HTMLInputElement | null = document.querySelector("#settings_projectKey");

const iconCheck = "c-icon_check_class";
const isActiveField = "is-active";

export class ConnectPanel extends BaseComponent {
  componentType = "ConnectPanel";

  constructor() {
    super();
  }

  initComponent(): void {
    initializeEvents();
  }
}

function initializeEvents() {
  // EventHub.getInstance().makeEvent(Events.UPDATE_ANNOTATION, () => {
  //   const body = {
  //     projectKey: $projectKey?.value,
  //     nodeId: "cec66bdf", // TODO: when integrated with the plugin, this should change to the node id from the figma file
  //     dataSource: $inputDataSource?.value,
  //     entity: $inputEntity?.value,
  //     attribute: $inputAttribute?.value,
  //     dataType: $inputDatatype?.value,
  //     value: $inputValue?.value,
  //   } as any;
  //   ApiClient.getInstance().upsertItem("annotation", "3414883772", body); // TODO: when integrated with the plugin, this should change to the itemKey of the figma file
  //   console.log(body); // TODO: remove this
  // });
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
    if (textField !== null && textArea !== null) {
      if (selectElement.value.trim().length !== 0) {
        changeElement1.disabled = false;
        textField.disabled = false;
        textArea.classList.remove("disabled");
      }
    }
  });
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
            values: {
              dataSrc: dataSrc.value.trim(),
              entity: entity.value.trim(),
              attribute: attribute.value.trim(),
              dataType: dataType.value.trim(),
              sampleValue: sampleValue.value.trim(),
            },
          },
        },
        "*",
      );
    }
  });
}
