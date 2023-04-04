import { EventHandler } from "./eventHandler";
import ApiClient from "../api/client";
import Annotation from "../../interfaces/interface.annotation";

// Class with all the events
export class EventHub {
  eventHandler = new EventHandler();
  api = new ApiClient();

  // Event to initialize the API
  init(
    baseURL: string | undefined,
    clientKey: string | undefined,
    sourceKey: string | undefined,
  ): Event {
    const event = this.eventHandler.makeEvent("click", () => {
      ApiClient.initialize({ baseURL, clientKey, sourceKey });
    });
    console.log("Initialized API"); // for testing - can be deleted after.
    this.getProjectData("75059577");
    return event;
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

  getProjectData(projectKey: string) {
    const data = this.api.getProject(projectKey);
    console.log(data); // DELETE THIS - temporary
    return data;
  }
}
