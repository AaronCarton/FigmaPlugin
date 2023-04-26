import { AnnotationInput } from "../interfaces/annotations";
import { initAnnotations, updateAnnotations } from "./annotationFunctions";

let initState = true;

export function checkInitState(values: AnnotationInput) {
  if (initState === true) {
    initState = false;
    initAnnotations(values);
  } else {
    updateAnnotations(figma.currentPage.selection, values);
  }
}
