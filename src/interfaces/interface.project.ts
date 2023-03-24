import ApiClient from "../services/api/client";
import { ODSObject } from "./ods/interface.ODSresponse";

export default class Project extends ODSObject<Project> {
  public lastUpdated: string;
  public customerId: string;

  constructor(project: Project, api: ApiClient) {
    super(api, project);

    this.lastUpdated = project.lastUpdated;
    this.customerId = project.customerId;
  }
}
