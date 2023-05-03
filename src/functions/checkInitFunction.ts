import { AnnotationInput } from "../interfaces/annotationInput";
import { initAnnotations, updateAnnotations } from "./annotationFunctions";
import { createFigmaError } from "./createError";

let initState = true;

export function checkInitState(values: AnnotationInput) {
  if (figma.currentPage.selection[0] !== undefined) {
    updateAnnotations(figma.currentPage.selection, values);
  } else {
    createFigmaError("Select something to create an annotation.", 5000, false);
  }
}
