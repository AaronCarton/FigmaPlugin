import ODSobject from "./ODS/interface.ODSobject";

export default interface Project extends ODSobject {
  lastUpdated: string;
  customerId: string;
}
