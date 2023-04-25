import { AnnotationInput } from "./annotations";

export interface annotationLinkItem {
  annotation: FrameNode;
  sourceNode: SceneNode;
  vector: VectorNode;
  data: AnnotationInput;
}
