import EventHub from "../services/events/EventHub";
import { Events } from "../services/events/Events";
import { BaseComponent } from "./baseComponent";

const $tabs: NodeListOf<HTMLElement> = document.querySelectorAll(".js-tab");
const $panelItems: NodeListOf<HTMLElement> = document.querySelectorAll(".js-panel-item");

const $connectionPanel: NodeListOf<HTMLElement> | null = document.querySelectorAll(".js-connection");
const $noConnectionPanel: NodeListOf<HTMLElement> | null = document.querySelectorAll(".js-disconnected");

const isActive = "is-active";

let connectionState = false;

export class NavigationTabs extends BaseComponent {
  componentType = "NavigationTabs";

  constructor() {
    super();
  }

  initComponent(): void {
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
          EventHub.getInstance().sendCustomEvent(Events.UI_CHANGE_TAB, { tab: selectedTab, connection: connectionState });
        }
      }),
    );
  }
}

export function changeConnectionState(state: boolean) {
  connectionState = state;
  if ($connectionPanel && $noConnectionPanel) {
    if (connectionState == true) {
      // $connectionPanel.classList.add(isActive);
      // $noConnectionPanel.classList.remove(isActive);
      $connectionPanel.forEach((item) => {
        item.classList.add(isActive);
      });
      $noConnectionPanel.forEach((item) => {
        item.classList.remove(isActive);
      });
    } else {
      // $connectionPanel.classList.remove(isActive);
      // $noConnectionPanel.classList.add(isActive);
      $connectionPanel.forEach((item) => {
        item.classList.remove(isActive);
      });
      $noConnectionPanel.forEach((item) => {
        item.classList.add(isActive);
      });
    }
  }
}
