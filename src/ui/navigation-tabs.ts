const tabs: NodeListOf<HTMLElement> = document.querySelectorAll(".js-tab");
const panelItems: NodeListOf<HTMLElement> = document.querySelectorAll(".js-panel-item");

const isActive = "is-active";

tabs.forEach((trigger) =>
  trigger.addEventListener("click", function () {
    const selectedTab = trigger.getAttribute("data-target")!;
    tabs.forEach((item) => {
      item.classList.remove(isActive);
    });
    panelItems.forEach((item) => {
      item.classList.remove(isActive);
    });
    trigger.classList.add(isActive);
    document.getElementById(selectedTab)?.classList.add(isActive);
    parent.postMessage({ pluginMessage: { type: "changeTab", tab: selectedTab } }, "*");
  }),
);
