import { EventHandler } from "./eventHandler";
import ApiClient from "../api/client";
import Annotation from "../../interfaces/interface.annotation";

// CHANGE CLASS
// No initialization for the API, just the name of events that make an event in the event handler

// Class with all the events
export class EventHub {
  eventHandler = new EventHandler();
  api = new ApiClient();

  // Event to initialize the API
  init(
    baseURL: string | undefined,
    clientKey: string | undefined,
    sourceKey: string | undefined,
    projectKey: string,
  ) {
    this.eventHandler.makeEvent("click", () => {
      ApiClient.initialize({ baseURL, clientKey, sourceKey });
      console.log(
        "Initialized baseurl: ",
        baseURL,
        " clientKey: ",
        clientKey,
        " sourceKey: ",
        sourceKey,
      ); // DELETE THIS - temporary
      this.getProjectData(projectKey);
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

  async getProjectData(projectKey: string) {
    // CHANGE THIS FOR PROMISE
    const data = await this.api.getProject(projectKey);
    console.log("before data"); // DELETE THIS - temporary
    console.log(data); // DELETE THIS - temporary
    console.log("after data"); // DELETE THIS - temporary
    return data;
  }
}
