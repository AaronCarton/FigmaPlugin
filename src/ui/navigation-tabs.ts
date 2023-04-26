const tabs: NodeListOf<HTMLElement> = document.querySelectorAll(".js-tab");
const panelItems: NodeListOf<HTMLElement> = document.querySelectorAll(".js-panel-item");

const connectionPanel: HTMLElement | null = document.querySelector(".js-connection");
const noConnectionPanel: HTMLElement | null = document.querySelector(".js-disconnected");

const isActive = "is-active";

// still testing connection purposes
const connectionState = true;

// still testing connection purposes
function checkConnectionPurpose() {
  if (connectionPanel !== null && noConnectionPanel !== null) {
    if (connectionState) {
      connectionPanel.classList.add(isActive);
      noConnectionPanel.classList.remove(isActive);
    } else {
      connectionPanel.classList.remove(isActive);
      noConnectionPanel.classList.add(isActive);
    }
    parent.postMessage(
      { pluginMessage: { type: "connectionCheck", payload: { connection: connectionState } } },
      "*",
    );
  }
}

tabs.forEach((trigger) =>
  trigger.addEventListener("click", function () {
    const selectedTab = trigger.getAttribute("data-target");
    tabs.forEach((item) => {
      item.classList.remove(isActive);
    });
    panelItems.forEach((item) => {
      item.classList.remove(isActive);
    });
    trigger.classList.add(isActive);
    if (selectedTab !== null) {
      document.getElementById(selectedTab)?.classList.add(isActive);
      parent.postMessage(
        {
          pluginMessage: {
            type: "changeTab",
            payload: { tab: selectedTab, connection: connectionState },
          },
        },
        "*",
      );
    }
  }),
);

// still testing connection purposes
checkConnectionPurpose();
