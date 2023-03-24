import ApiClient from "../services/api/client";
import { ODSObject } from "./ods/interface.ODSresponse";

export default class Annotation extends ODSObject<Annotation> {
  public projectKey: string;
  public dataSource: string;
  public entity: string;
  public attribute: string;
  public dataType: string;
  public value: string;

  constructor(annotation: Annotation, api: ApiClient) {
    super(api, annotation);

    this.projectKey = annotation.projectKey;
    this.dataSource = annotation.dataSource;
    this.entity = annotation.entity;
    this.attribute = annotation.attribute;
    this.dataType = annotation.dataType;
    this.value = annotation.value;
  }
}
