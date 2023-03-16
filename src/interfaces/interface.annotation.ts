import ODSobject from "./ODS/interface.ODSobject"

export default interface Annotation extends ODSobject {
  dataSource: string
  entity: string
  attribute: string
  dataType: string
  value: string
}
