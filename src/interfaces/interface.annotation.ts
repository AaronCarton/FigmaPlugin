import { ODSobject } from "./ods/interface.ODSresponse";

export interface IAnnotation {
  dataSource: string;
  entity: string;
  attribute: string;
  dataType: string;
  value: string;
  deleted: boolean;
}

export default interface Annotation extends IAnnotation, ODSobject {}
