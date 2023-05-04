import { ODSObject } from "./ods/interface.ODSresponse";

export interface IAnnotation {
  projectKey: string;
  nodeId: string;
  dataSource: string;
  entity: string;
  attribute: string;
  dataType: string;
  value: string;
}

export default class Annotation extends ODSObject<Annotation> implements IAnnotation {
  public projectKey: string;
  public nodeId: string;
  public dataSource: string;
  public entity: string;
  public attribute: string;
  public dataType: string;
  public value: string;

  constructor(annotation: Annotation) {
    super(annotation);

    this.projectKey = annotation.projectKey;
    this.nodeId = annotation.nodeId;
    this.dataSource = annotation.dataSource;
    this.entity = annotation.entity;
    this.attribute = annotation.attribute;
    this.dataType = annotation.dataType;
    this.value = annotation.value;
  }
}
