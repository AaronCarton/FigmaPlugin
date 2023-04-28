import { AnnotationInput } from "./annotationInput";

export interface annotationLinkItem {
  annotation: FrameNode;
  sourceNode: SceneNode;
  vector: VectorNode;
  data: AnnotationInput;
}
