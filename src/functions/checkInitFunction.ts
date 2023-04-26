import { initAnnotations, updateAnnotations } from "./annotationFunctions";

let initState = true;

export function checkInitState(payload: any) {
  if (initState === true) {
    initState = false;
    initAnnotations(payload.values);
  } else {
    updateAnnotations(figma.currentPage.selection, payload.values);
  }
}
