const buttons: NodeListOf<HTMLElement> = document.querySelectorAll(".js-btn");

const iconCheck = "c-icon--check";
const isActiveField = "is-active-field";

buttons.forEach((trigger) => {
  trigger.addEventListener("click", function () {
    const selectedButton = trigger.getAttribute("data-target")!;
    trigger.classList.toggle(iconCheck);
    document.getElementById(`${selectedButton}-text`)?.classList.toggle(isActiveField);
    document.getElementById(`${selectedButton}-select`)?.classList.toggle(isActiveField);
  });
});
