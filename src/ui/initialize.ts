$baseURL;
$clientKey;
$sourceKey;

function setBaseUrl(baseURLValue: string) {
  figma.clientStorage.setAsync("baseURL", baseURLValue);
}

function setClientKey(clientKeyValue: string) {
  figma.clientStorage.setAsync("clientKey", clientKeyValue);
}

function setSourceKey(sourceKeyValue: string) {
  figma.clientStorage.setAsync("sourceKey", sourceKeyValue);
}

function isBaseUrlSet(): boolean {
  return figma.clientStorage.getAsync("baseURL") != null;
}

function isClientKeySet(): boolean {
  return figma.clientStorage.getAsync("clientKey") != null;
}

function isSourceKeySet(): boolean {
  return figma.clientStorage.getAsync("sourceKey") != null;
}
function checkIfKeysAreSet() {
  if (isBaseUrlSet() && isClientKeySet() && isSourceKeySet()) {
    return true;
  } else {
    return false;
  }
}
function fillInputfields() {
  $baseURL.value = figma.clientStorage.getAsync("baseURL");
  $clientKey.value = figma.clientStorage.getAsync("clientKey");
  $sourceKey.value = figma.clientStorage.getAsync("sourceKey");
}
// function initialize(inputBaseURL: string, inputClientKey: string, inputSourceKey: string) {
//   if (!(isBaseUrlSet() && isClientKeySet() && isSourceKeySet())) {
//     setBaseUrl(inputBaseURL); // Set the base URL
//     setClientKey(inputClientKey); // Set the client key
//     setSourceKey(inputSourceKey); // Set the source key
//   } else {
//     // If the keys are already set, fill the input fields with the values
//     $baseURL.value = figma.clientStorage.getAsync("baseURL");
//     $clientKey.value = figma.clientStorage.getAsync("clientKey");
//     $sourceKey.value = figma.clientStorage.getAsync("sourceKey");
//   }
// }
function initialize() {
  if (checkIfKeysAreSet()) {
    fillInputfields();
  }
}
initialize();
