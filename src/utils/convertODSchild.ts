import ODSobject from "../interfaces/ODS/interface.ODSobject";

export default <T>(obj: ODSobject): T => {
  const x = obj as Partial<ODSobject>;
  delete x.itemKey;
  delete x.itemType;
  delete x.localized;
  delete x.partition;

  return x as T;
};
