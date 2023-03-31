import ApiClient from "./services/api/client";
import Annotation from "./interfaces/interface.annotation";
import Project from "./interfaces/interface.project";

export default class Sample {
  api = ApiClient.initialize({
    baseURL: "http://localhost:1139",
    clientKey: "123",
    sourceKey: "123",
  });

  annotation = {
    projectKey: "195",
    nodeId: "f249d3d2",
    dataSource: "someSource",
    entity: "someEntity",
    attribute: "title",
    dataType: "string",
    value: "Some neat title",
  };

  project = {
    lastUpdated: new Date().toISOString(),
    customerId: "1234",
  };

  async createAnnotation(projectKey: string, annotation: Annotation) {
    const response = await this.api.createAnnotation(projectKey, annotation);
    console.log(response);
    return response;
  }
  async createProject(projectKey: string, project: Project) {
    const response = await this.api.createProject(projectKey, project);
    console.log(response);
    return response;
  }
  async getProject(projectKey: string) {
    const response = await this.api.getProject(projectKey);
    console.log(response);
    return response;
  }
  async getAnnotations(projectKey: string) {
    const response = await this.api.getAnnotations(projectKey);
    console.log(response);
    return response;
  }
}
