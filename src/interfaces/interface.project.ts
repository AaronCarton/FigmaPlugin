import ODSobject from "./ODS/interface.ODSobject";

export interface IProject {
  lastUpdated: string;
  customerId: string;
}

export default interface Project extends IProject, ODSobject {}
