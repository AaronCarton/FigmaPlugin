import { EventHandler } from "./eventHandler";

// Class with all the events
export class EventHub {
  eventHandler = new EventHandler();

  // Event that initializes with the database
  init(baseURL: string, clientKey: string, sourceKey: string) {
    return null;
  }

  // Event to create a new datasource, entity, attribute, or datatype
  create(type: string, data: any) {
    return null;
  }

  // Event to update the annotation
  updateAnnotation(annotation: Annotation) {
    return null;
  }
}
