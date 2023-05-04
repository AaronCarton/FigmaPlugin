import ApiClient from "../services/api/client";
import { ODSObject } from "./ods/interface.ODSresponse";

export interface IProject {
  lastUpdated: string;
  customerId: string;
}

export default class Project extends ODSObject<Project> implements IProject {
  public lastUpdated: string;
  public customerId: string;

  constructor(project: Project) {
    super(project);

    this.lastUpdated = project.lastUpdated;
    this.customerId = project.customerId;
  }
}
