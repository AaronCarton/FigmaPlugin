const buttons: NodeListOf<HTMLElement> | null = document.querySelectorAll(".js-btn");

const dataSrc: HTMLInputElement | null = document.querySelector(".js-data-source");
const entity: HTMLInputElement | null = document.querySelector(".js-entity");
const attribute: HTMLInputElement | null = document.querySelector(".js-attribute");
const dataType: HTMLInputElement | null = document.querySelector(".js-data-type");
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

if (
  buttons !== null &&
  dataSrc !== null &&
  entity !== null &&
  attribute !== null &&
  dataType !== null &&
  sampleValue !== null
) {
  buttons.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      buttonTrigger(trigger);
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
