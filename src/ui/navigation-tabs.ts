const tabs: NodeListOf<HTMLElement> = document.querySelectorAll(".js-tab");
const panelItems: NodeListOf<HTMLElement> = document.querySelectorAll(".js-panel-item");

const connectionPanel: HTMLElement = document.querySelector(".js-connection")!;
const noConnectionPanel: HTMLElement = document.querySelector(".js-disconnected")!;

const isActive = "is-active";

// still testing connection purposes
const connectionState = true;

// still testing connection purposes
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
  trigger.addEventListener("click", () => {
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
      {
        pluginMessage: { type: "changeTab", tab: selectedTab, connection: connectionState },
      },
      "*",
    );
  }),
);

// still testing connection purposes
checkConnection();
