import { BaseComponent } from "./baseComponent";

const buttons: NodeListOf<HTMLElement> = document.querySelectorAll(".js-btn");

const iconCheck = "c-icon_check_class";
const isActiveField = "is-active";

export class ConnectPanel extends BaseComponent {
  componentType = "ConnectPanel";

  constructor() {
    super();
  }

  initializeComponent(): void {
    buttons.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        toggleFields(trigger);
      });
    });
  }
}

function toggleFields(button: HTMLElement) {
  const selectedButton = button.getAttribute("data-target");
  button.classList.toggle(iconCheck);
  document.getElementById(`${selectedButton}-text`)?.classList.toggle(isActiveField);
  document.getElementById(`${selectedButton}-select`)?.classList.toggle(isActiveField);
}
