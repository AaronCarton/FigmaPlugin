import { EventHandler } from "./eventHandler";
import ApiClient from "../api/client";
import Annotation from "../../interfaces/interface.annotation";

// Class with all the events
export class EventHub {
  eventHandler = new EventHandler();
  api = new ApiClient();

  // Event that initializes with the database
  init(baseURL: string, clientKey: string, sourceKey: string) {
    this.eventHandler.makeEvent("click", () => {
      ApiClient.initialize({ baseURL, clientKey, sourceKey });
    });
  }

  // Event to create a new datasource, entity, attribute, or datatype
  createChild(type: string, data: any, itemKey: string) {
    this.eventHandler.makeEvent("click", () => {
      this.api.upsertItem(type, itemKey, data);
    });
  }

  // Event to update the annotation
  updateAnnotation(itemKey: string, annotation: Annotation) {
    this.eventHandler.makeEvent("click", () => {
      this.api.createAnnotation(itemKey, annotation);
    });
  }
}
