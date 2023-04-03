import { EventHandler } from "./eventHandler";
import ApiClient from "../api/client";

// Class with all the events
export class EventHub {
  eventHandler = new EventHandler();

  // Event that initializes with the database
  init(baseURL: string, clientKey: string, sourceKey: string) {
    this.eventHandler.makeEvent("click", (event: any) => {
      ApiClient.initialize({ baseURL, clientKey, sourceKey });
    });
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
