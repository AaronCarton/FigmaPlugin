import Annotation from "../../interfaces/interface.annotation";
import { EventHandler } from "./eventHandler";

// Class with all the events
export class EventHub {
  eventHandler = new EventHandler();
  // Initialize with db
  initialize(baseURL: string, clientKey: string, sourceKey: string) {
    return null;
  }

  // Update annotation
  updateAnnotation(annotation: Annotation) {
    return null;
  }
}
