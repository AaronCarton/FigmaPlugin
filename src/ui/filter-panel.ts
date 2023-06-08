import { BaseComponent } from "./baseComponent";

const $searchBoxes: NodeListOf<HTMLInputElement> | null = document.querySelectorAll(".js-filter-search");
const $resetFilterButton: HTMLButtonElement | null = document.querySelector(".js-reset-btn");
const $filterButton: HTMLButtonElement | null = document.querySelector(".js-filter-btn");
const $filterSelectors: NodeListOf<HTMLButtonElement> | null = document.querySelectorAll(".js-filter");
const $isFilterActive: HTMLElement | null = document.querySelector(".js-filter-active");

export class FilterPanel extends BaseComponent {
  componentType = "FilterPanel";

  constructor() {
    super();
  }

  initComponent(): void {
    initializeFilterFunction();
    toggleDropdownFilter();
    searchInDropdownFilter();
    clickOutside("dataSource");
    clickOutside("entity");
    clickOutside("attribute");
    clickOutside("dataType");
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
      resetFilterFields("dataSource", "source");
      resetFilterFields("entity", "entity");
      resetFilterFields("attribute", "attribute");
      resetFilterFields("dataType", "type");
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

function toggleDropdownFilter() {
  if ($filterSelectors) {
    $filterSelectors.forEach((selector) => {
      selector.addEventListener("click", () => {
        const $dataTarget: string | null = selector.getAttribute("data-target");
        const $dropDownTarget: HTMLElement | null = document.querySelector(`#${$dataTarget}-filter-dropdown`);
        const $searchTarget: HTMLInputElement | null = document.querySelector(`#${$dataTarget}-filter-search`);
        $dropDownTarget?.classList.toggle("is-active");
        selector.classList.toggle("hold-focus");
        $searchTarget?.focus();
        if ($dataTarget) {
          listenToDropdownItemsFilter($dataTarget);
        }
      });
    });
  }
}

function searchInDropdownFilter() {
  if ($searchBoxes) {
    $searchBoxes.forEach((searchBox) => {
      searchBox.addEventListener("keyup", () => {
        const $dataTarget: string | null = searchBox.getAttribute("data-target");
        const $dropDownTargetItems: NodeListOf<HTMLButtonElement> | null = document.querySelectorAll(`.js-dropdown-${$dataTarget}-filter-item`);
        $dropDownTargetItems?.forEach((item) => {
          if (item.value.toUpperCase().indexOf(searchBox.value.toUpperCase()) > -1) {
            item.style.display = "block";
          } else {
            item.style.display = "none";
          }
        });
      });
    });
  }
}

function clickOutside(target: string) {
  const $area: HTMLElement | null = document.querySelector(`.js-dropdown-${target}-filter-area`);
  const $panel: HTMLButtonElement | null = document.querySelector(`#${target}-filter-dropdown`);
  const $selectTarget: HTMLButtonElement | null = document.querySelector(`#${target}-filter`);

  document.addEventListener("click", (event: any) => {
    if ($area && $panel) {
      const isClickedInside = $area.contains(event.target);
      if (!isClickedInside) {
        $panel.classList.remove("is-active");
        $selectTarget?.classList.remove("hold-focus");
      }
    }
  });
}

function listenToDropdownItemsFilter(target: string) {
  const $dropDownItems: NodeListOf<HTMLButtonElement> | null = document.querySelectorAll(`.js-dropdown-${target}-filter-item`);

  $dropDownItems.forEach((item) => {
    item.addEventListener("click", () => {
      const $dataTarget: string | null = item.getAttribute("data-target");
      const $targetSelect: HTMLButtonElement | null = document.querySelector(`#${$dataTarget}-filter`);
      const $dropDownTarget: HTMLButtonElement | null = document.querySelector(`#${$dataTarget}-filter-dropdown`);
      const $selectTarget: HTMLButtonElement | null = document.querySelector(`#${$dataTarget}-select`);
      if ($targetSelect && $dropDownTarget) {
        $targetSelect.innerHTML = item.innerHTML;
        $targetSelect.value = item.value;
        $targetSelect?.dispatchEvent(new Event("change"));
        $dropDownTarget.classList.remove("is-active");
        $selectTarget?.classList.remove("hold-focus");
      }
    });
  });
}

function resetFilterFields(name: string, text: string) {
  const selector: HTMLButtonElement | null = document.querySelector(`#${name}-filter`);
  if (selector) {
    selector.innerHTML = `Choose ${text}`;
  }
}
