import { ODSobject } from "./ods/interface.ODSresponse";

export interface IProject {
  lastUpdated: string;
  customerId: string;
}

export default interface Project extends IProject, ODSobject {}
