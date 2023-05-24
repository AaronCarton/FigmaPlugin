import EventHub from "../services/events/EventHub";
import { Events } from "../services/events/Events";
import { BaseComponent } from "./baseComponent";

const $resetFilterButton: HTMLButtonElement | null = document.querySelector(".js-reset-btn");
const $filterButton: HTMLButtonElement | null = document.querySelector(".js-filter-btn");
const $filterItems: NodeListOf<HTMLElement> | null = document.querySelectorAll(".js-filter-item");
const $removeFilter: NodeListOf<HTMLElement> | null = document.querySelectorAll(".js-remove-filter");
const $filterSelectors: NodeListOf<HTMLInputElement> | null = document.querySelectorAll(".js-filter");
let count: number = 0;

export class FilterPanel extends BaseComponent {
  componentType = "FilterPanel";

  constructor() {
    super();
  }

  initComponent(): void {
    initializeFilterFunction();
  }
}

function initializeFilterFunction() {
  if ($resetFilterButton && $filterButton && $filterSelectors) {
    $filterButton.addEventListener("click", () => {
      count = 0;
      $filterSelectors.forEach((selector) => {
        showFiltersConnectPanel(selector);
      });
      if ($filterItems) {
        $filterItems.forEach((item) => {
          if (item.classList.contains("is-active")) {
            count++;
          }
        });
        EventHub.getInstance().sendCustomEvent(Events.UI_CHANGE_FILTER, count);
      }
    });

    $resetFilterButton.addEventListener("click", () => {
      count = 0;
      $filterSelectors.forEach((selector) => {
        selector.value = "";
        selector.disabled = false;
      });
      $filterItems?.forEach((item) => {
        item.classList.remove("is-active");
      });
      EventHub.getInstance().sendCustomEvent(Events.UI_CHANGE_FILTER, count);
    });

    $filterSelectors.forEach((selector) => {
      selector.addEventListener("change", () => {
        if (selector.value !== "") {
          $filterSelectors.forEach((selector) => {
            selector.disabled = true;
          });
          selector.disabled = false;
        } else {
          $filterSelectors.forEach((selector) => {
            selector.disabled = false;
          });
        }
      });
    });

    removeFilterItem();
  }
}

function showFiltersConnectPanel(input: HTMLInputElement) {
  const target = input.getAttribute("data-target");
  const targetItem = document.querySelector<HTMLElement>(`#${target}-item`);
  const targetText = document.querySelector<HTMLElement>(`#${target}-text`);
  if (input.value !== "") {
    if (targetItem && targetText) {
      targetItem.classList.add("is-active");
      targetText.innerHTML = input.value;
    }
  } else if (targetItem && targetText) {
    targetItem.classList.remove("is-active");
    targetText.innerHTML = "";
  }
}

function removeFilterItem() {
  $removeFilter?.forEach((item) => {
    item.addEventListener("click", () => {
      const target = item.getAttribute("data-target");
      const targetItem = document.querySelector<HTMLElement>(`#${target}`);
      targetItem?.classList.remove("is-active");
      count--;
      EventHub.getInstance().sendCustomEvent(Events.UI_REMOVE_FILTER, count);
      unselectRemoved();
    });
  });
}

function unselectRemoved() {
  $filterSelectors?.forEach((selector) => {
    selector.disabled = false;
    selector.value = "";
  });
}
