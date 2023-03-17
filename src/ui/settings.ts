const checkConnection = async () => {
  const $dbURL: HTMLInputElement | null = document.querySelector("#settings_dbLink")
  const $apiKey: HTMLInputElement | null = document.querySelector("#settings_apiKey")
  const dbURL: string | null | undefined = $dbURL?.value
  const apiKey: string | null | undefined = $apiKey?.value
  //later change with the correct fetch request when api client is done
  //add form validtion when we have the parameters for example the api key + url
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

const init = () => {
  const $button: HTMLButtonElement | null = document.querySelector(".c-plugin__btnConnect")
  $button?.addEventListener("click", checkConnection)
  const $annotationToggle: HTMLInputElement | null = document.querySelector("#annotationToggle")
  $annotationToggle?.addEventListener("click", toggleAnnotations)
}

init()
