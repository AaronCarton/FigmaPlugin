import { Filters } from "../interfaces/interface.EventHub";
import EventHub from "../services/events/EventHub";
import { Events } from "../services/events/Events";
import { BaseComponent } from "./baseComponent";
import { projectKey, toggleSpinner } from "./settings-panel";

const $resetFilterButton: HTMLButtonElement | null = document.querySelector(".js-reset-btn");
const $filterButton: HTMLButtonElement | null = document.querySelector(".js-filter-btn");
const $filterSelectors: NodeListOf<HTMLInputElement> | null = document.querySelectorAll(".js-filter");
const $isFilterActive: HTMLElement | null = document.querySelector(".js-filter-active");

export class FilterPanel extends BaseComponent {
  componentType = "FilterPanel";

  constructor() {
    super();
  }

  initComponent(): void {
    initializeFilterFunction();
    initListeners();
  }
}
function initListeners(): void {
  EventHub.getInstance().makeEvent(Events.ANNOTATION_UPSERTED, (annotation) => {
    // add the annotation values to the filter selectors
    $filterSelectors?.forEach((selector) => {
      switch (selector.name) {
        case "dataSource":
          selector.add(new Option(annotation.dataSource, annotation.dataSource));
          break;
        case "entity":
          selector.add(new Option(annotation.entity, annotation.entity));
          break;
        case "attribute":
          selector.add(new Option(annotation.attribute, annotation.attribute));
          break;
        case "dataType":
          selector.add(new Option(annotation.dataType, annotation.dataType));
          break;
      }
    });
  });
}

function initializeFilterFunction() {
  if ($resetFilterButton && $filterButton && $filterSelectors && $isFilterActive) {
    $filterButton.addEventListener("click", () => {
      $isFilterActive.style.opacity = "1";
      $resetFilterButton.disabled = false;
      $filterButton.disabled = true;
      applyFilters();
    });

    $resetFilterButton.addEventListener("click", () => {
      $filterSelectors.forEach((selector) => {
        selector.value = "";
        selector.disabled = false;
      });
      $isFilterActive.style.opacity = "0";
      $resetFilterButton.disabled = true;
      $filterButton.disabled = true;
      applyFilters();
    });

    $filterSelectors.forEach((selector) => {
      selector.addEventListener("change", () => {
        $filterSelectors.forEach((selector) => {
          selector.disabled = false;
          $filterButton.disabled = false;
        });
      });
    });
  }
}

function applyFilters() {
  const filters: { [key: string]: string[] } = {};
  $filterSelectors?.forEach((selector) => {
    if (selector.value) {
      filters[selector.name] = [selector.value];
    }
  });
  filters["projectKey"] = [projectKey];

  toggleSpinner(true);
  EventHub.getInstance().sendCustomEvent(Events.APPLY_FILTERS, filters as unknown as Filters);
}
