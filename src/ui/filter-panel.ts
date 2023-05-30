import { BaseComponent } from "./baseComponent";

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
  }
}

function initializeFilterFunction() {
  if ($resetFilterButton && $filterButton && $filterSelectors && $isFilterActive) {
    $filterButton.addEventListener("click", () => {
      $isFilterActive.style.opacity = "1";
      $resetFilterButton.disabled = false;
      $filterButton.disabled = true;
    });

    $resetFilterButton.addEventListener("click", () => {
      $filterSelectors.forEach((selector) => {
        selector.value = "";
        selector.disabled = false;
      });
      $isFilterActive.style.opacity = "0";
      $resetFilterButton.disabled = true;
      $filterButton.disabled = true;
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
