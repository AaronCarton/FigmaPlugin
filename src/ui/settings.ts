//input elements
const $dbURL: HTMLInputElement | null = document.querySelector("#settings_dbLink")
const $apiKey: HTMLInputElement | null = document.querySelector("#settings_apiKey")
const $annotationToggle: HTMLInputElement | null = document.querySelector("#annotationToggle")
const $button: HTMLButtonElement | null = document.querySelector(".c-plugin__btnConnect")

const checkConnection = async () => {
  const dbURL: string | null | undefined = $dbURL?.value
  const apiKey: string | null | undefined = $apiKey?.value
  console.log(dbURL, apiKey)
}

const toggleAnnotations = (e: Event) => {
  const state: boolean = (<HTMLInputElement>e.target).checked
  if (state === true) {
    console.log("show annotations")
  } else {
    console.log("hide annotations")
  }
}

const disableFields = () => {
  console.log($dbURL?.value)
  if ($dbURL !== null && $apiKey !== null && $annotationToggle !== null && $button !== null) {
    $annotationToggle.disabled = true
    if ($dbURL.value !== "") {
      $apiKey.disabled = false
    } else {
      $apiKey.disabled = true
    }
    if ($dbURL.value === "" || $apiKey.value === "") {
      $button.removeEventListener("click", checkConnection)
    }
    if ($dbURL.value !== "" && $apiKey.value !== "") {
      $annotationToggle.disabled = false
      $button.addEventListener("click", checkConnection)
    }
  }
}

const init = () => {
  disableFields()
  $annotationToggle?.addEventListener("click", toggleAnnotations)
  $dbURL?.addEventListener("keyup", disableFields)
  $apiKey?.addEventListener("keyup", disableFields)
}

init()
