import { frame } from "../interfaces/frame";

export class annotationElements {
  public static annotationLayer: FrameNode;
  public static parentFrames: Array<frame> = [];
  public static currentpage: PageNode = figma.currentPage;
}
