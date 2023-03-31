const buttons: NodeListOf<HTMLElement> | null = document.querySelectorAll(".js-btn");

const dataSrc: HTMLInputElement | null = document.querySelector(".js-data-source");
const dataSrcText: HTMLInputElement | null = document.querySelector(".js-data-source-text");
const entity: HTMLInputElement | null = document.querySelector(".js-entity");
const entityText: HTMLInputElement | null = document.querySelector(".js-entity-text");
const attribute: HTMLInputElement | null = document.querySelector(".js-attribute");
const attributeText: HTMLInputElement | null = document.querySelector(".js-attribute-text");
const dataType: HTMLInputElement | null = document.querySelector(".js-data-type");
const dataTypeText: HTMLInputElement | null = document.querySelector(".js-data-type-text");
const sampleValue: HTMLInputElement | null = document.querySelector(".js-sample-value");

const iconCheck = "c-icon_check_class";
const isActiveField = "is-active";

let counter = 0;
let exist = false;

function buttonTrigger(trigger: HTMLElement) {
  const selectedButton = trigger.getAttribute("data-target");
  const inputSelect: HTMLSelectElement | null = document.querySelector(`#${selectedButton}-select`);
  const inputText: HTMLElement | null = document.querySelector(`#${selectedButton}-text`);
  const inputField: HTMLInputElement | null = document.querySelector(`#${selectedButton}-field`);

  if (
    selectedButton !== null &&
    inputSelect !== null &&
    inputText !== null &&
    inputField !== null
  ) {
    if (counter === 0) {
      counter++;
    } else {
      const newOption = document.createElement("option");
      const event = new Event("change");
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
      inputSelect.dispatchEvent(event);
      counter--;
    }

    trigger.classList.toggle(iconCheck);
    inputText.classList.toggle(isActiveField);
    inputSelect.classList.toggle(isActiveField);
  }
}

function checkFields(
  selectElement: HTMLInputElement,
  changeElement1: HTMLInputElement,
  changeElement2: HTMLInputElement,
  disabledId: string,
) {
  selectElement.addEventListener("change", () => {
    if (selectElement.value.trim().length !== 0) {
      changeElement1.disabled = false;
      changeElement2.disabled = false;
      document.getElementById(`${disabledId}-text`)?.classList.remove("disabled");
    }
  });
}

if (
  buttons !== null &&
  dataSrc !== null &&
  dataSrcText !== null &&
  entity !== null &&
  entityText !== null &&
  attribute !== null &&
  attributeText !== null &&
  dataType !== null &&
  dataTypeText !== null &&
  sampleValue !== null
) {
  buttons.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      buttonTrigger(trigger);
    });
  });

  checkFields(dataSrc, entity, entityText, "entity");
  checkFields(entity, attribute, attributeText, "attribute");
  checkFields(attribute, dataType, dataTypeText, "data-type");

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
            values: [
              dataSrc.value,
              entity.value,
              attribute.value,
              dataType.value,
              sampleValue.value,
            ],
          },
        },
        "*",
      );
    }
  });
}
