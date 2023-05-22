import { BaseComponent } from "./baseComponent";

const $resetFilter: HTMLButtonElement | null = document.querySelector(".js-reset-btn");
const $filterButton: HTMLButtonElement | null = document.querySelector(".js-filter-btn");
const $dataSource: HTMLInputElement | null = document.querySelector(".js-dataSource-filter");
const $entity: HTMLInputElement | null = document.querySelector(".js-entity-filter");
const $attribute: HTMLInputElement | null = document.querySelector(".js-attribute-filter");
const $dataType: HTMLInputElement | null = document.querySelector(".js-dataType-filter");

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
    console.log($dataSource.value);
    console.log($entity.value);
    console.log($attribute.value);
    console.log($dataType.value);
  });
  $resetFilter.addEventListener("click", () => {
    $dataSource.value = "";
    $entity.value = "";
    $attribute.value = "";
    $dataType.value = "";
  });
}
