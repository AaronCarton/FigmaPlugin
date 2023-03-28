const buttons: NodeListOf<HTMLElement> = document.querySelectorAll(".js-btn");

const iconCheck = "c-icon_check_class";
const isActiveField = "is-active";

const toggleFields = (button: HTMLElement) => {
  const selectedButton = button.getAttribute("data-target")!;
  button.classList.toggle(iconCheck);
  document.getElementById(`${selectedButton}-text`)?.classList.toggle(isActiveField);
  document.getElementById(`${selectedButton}-select`)?.classList.toggle(isActiveField);
};

buttons.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    toggleFields(trigger);
  });
});
