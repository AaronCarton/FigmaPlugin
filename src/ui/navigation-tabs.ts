const tabs: NodeListOf<HTMLElement> = document.querySelectorAll(".js-tab");
const panelItems: NodeListOf<HTMLElement> = document.querySelectorAll(".js-panel-item");

const connectionPanel: HTMLElement = document.querySelector(".js-connection")!;
const noConnectionPanel: HTMLElement = document.querySelector(".js-no-connection")!;

const isActive = "is-active";
const connectionState = true;

const checkConnection = () => {
  if (connectionState) {
    connectionPanel.classList.add(isActive);
    noConnectionPanel.classList.remove(isActive);
  } else {
    connectionPanel.classList.remove(isActive);
    noConnectionPanel.classList.add(isActive);
  }
  parent.postMessage(
    { pluginMessage: { type: "connectionCheck", connection: connectionState } },
    "*",
  );
};

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
    parent.postMessage(
      { pluginMessage: { type: "changeTab", tab: selectedTab, connection: connectionState } },
      "*",
    );
  }),
);

checkConnection();
