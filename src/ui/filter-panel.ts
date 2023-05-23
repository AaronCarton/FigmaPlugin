import EventHub from "../services/events/EventHub";
import { Events } from "../services/events/Events";
import { BaseComponent } from "./baseComponent";
import { $filterItems, $removeFilter } from "./connect-panel";

const $resetFilter: HTMLButtonElement | null = document.querySelector(".js-reset-btn");
const $filterButton: HTMLButtonElement | null = document.querySelector(".js-filter-btn");
const $dataSource: HTMLInputElement | null = document.querySelector(".js-dataSource-filter");
const $entity: HTMLInputElement | null = document.querySelector(".js-entity-filter");
const $attribute: HTMLInputElement | null = document.querySelector(".js-attribute-filter");
const $dataType: HTMLInputElement | null = document.querySelector(".js-dataType-filter");
let count: number = 0;

export class FilterPanel extends BaseComponent {
  componentType = "FilterPanel";

  constructor() {
    super();
  }

  initComponent(): void {
    console.log("Filter panel initialized.");
  }
}

if ($resetFilter && $filterButton && $dataSource && $entity && $attribute && $dataType) {
  $filterButton.addEventListener("click", () => {
    count = 0;
    showFiltersConnectPanel($dataSource);
    showFiltersConnectPanel($entity);
    showFiltersConnectPanel($attribute);
    showFiltersConnectPanel($dataType);
    if ($filterItems) {
      $filterItems.forEach((item) => {
        if (item.classList.contains("is-active")) {
          count++;
        }
      });
      console.log("[COUNT OF ITEMS]: ", count);
      EventHub.getInstance().sendCustomEvent(Events.UI_CHANGE_FILTER, count);
    }
  });
  $resetFilter.addEventListener("click", () => {
    count = 0;
    $dataSource.value = "";
    $entity.value = "";
    $attribute.value = "";
    $dataType.value = "";
    $filterItems?.forEach((item) => {
      item.classList.remove("is-active");
    });
    EventHub.getInstance().sendCustomEvent(Events.UI_CHANGE_FILTER, count);
  });
  removeFilterItem();
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
  } else {
    if (targetItem && targetText) {
      targetItem.classList.remove("is-active");
      targetText.innerHTML = "";
    }
  }
}

function removeFilterItem() {
  $removeFilter?.forEach((item) => {
    item.addEventListener("click", () => {
      const target = item.getAttribute("data-target");
      const prop = target?.split("-")[0];
      console.log("[PROP]: ", prop);
      const targetItem = document.querySelector<HTMLElement>(`#${target}`);
      targetItem?.classList.remove("is-active");
      count--;
      EventHub.getInstance().sendCustomEvent(Events.UI_REMOVE_FILTER, count);
      unselectRemoved(prop!);
    });
  });
}

function unselectRemoved(name: string) {
  if (name === "dataSource" && $dataSource) {
    $dataSource.value = "";
  }
  if (name === "entity" && $entity) {
    $entity.value = "";
  }
  if (name === "attribute" && $attribute) {
    $attribute.value = "";
  }
  if (name === "dataType" && $dataType) {
    $dataType.value = "";
  }
}
