import { MessageTitle } from "../classes/messageTitles";
import { BaseComponent } from "./baseComponent";

const $tabs: NodeListOf<HTMLElement> = document.querySelectorAll(".js-tab");
const $panelItems: NodeListOf<HTMLElement> = document.querySelectorAll(".js-panel-item");

const $connectionPanel: HTMLElement | null = document.querySelector(".js-connection");
const $noConnectionPanel: HTMLElement | null = document.querySelector(".js-disconnected");

const isActive = "is-active";

// Still testing connection purposes
let connectionState = false;

export class NavigationTabs extends BaseComponent {
  componentType = "NavigationTabs";

  constructor() {
    super();
  }

  initComponent(): void {
    // checkConnectionPurpose();
    this.navigateBetweenTabs();
  }

  private navigateBetweenTabs() {
    $tabs.forEach((tab) =>
      tab.addEventListener("click", () => {
        const selectedTab = tab.getAttribute("data-target");
        $tabs.forEach((item) => {
          item.classList.remove(isActive);
        });
        $panelItems.forEach((item) => {
          item.classList.remove(isActive);
        });
        tab.classList.add(isActive);
        if (selectedTab !== null) {
          document.getElementById(selectedTab)?.classList.add(isActive);
          parent.postMessage(
            {
              pluginMessage: {
                type: MessageTitle.changeTab,
                payload: {
                  tab: selectedTab,
                  connection: connectionState,
                },
              },
            },
            "*",
          );
        }
      }),
    );
  }
}

// still testing connection purposes
function checkConnectionPurpose() {
  if ($connectionPanel !== null && $noConnectionPanel !== null) {
    if (connectionState) {
      $connectionPanel.classList.add(isActive);
      $noConnectionPanel.classList.remove(isActive);
    } else {
      $connectionPanel.classList.remove(isActive);
      $noConnectionPanel.classList.add(isActive);
    }
    parent.postMessage(
      {
        pluginMessage: {
          type: MessageTitle.connectionCheck,
          payload: { connection: connectionState },
        },
      },
      "*",
    );
  }
}

export function changeConnectionState(state: boolean) {
  connectionState = state;
  if ($connectionPanel && $noConnectionPanel) {
    if (connectionState == true) {
      $connectionPanel.classList.add(isActive);
      $noConnectionPanel.classList.remove(isActive);
    } else {
      $connectionPanel.classList.remove(isActive);
      $noConnectionPanel.classList.add(isActive);
    }
  }
}
// Still testing connection purposes
// checkConnectionPurpose();
