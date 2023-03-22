/**
 * ODSobject is a generic interface for the objects returned by the ODS API.
 * As all objects will include these properties.
 */
export interface ODSobject {
  itemType: string;
  partition: string;
  itemKey: string;
  localized: [];
}

/**
 *  ODSresponse is a generic interface for the response from the ODS API.
 * @param T is the type of the item in the response (e.g. Annotation)
 * @param U is the type of an optional parent object in the response (e.g. Project)
 * @param K is the key under which the parent will be found (e.g. "project")
 */
export interface ODSresponse<T extends ODSobject, U = undefined, K extends string = ""> {
  results: Array<
    {
      item: T;
    } & (U extends undefined
      ? object // or {}
      : {
          [P in K]: U;
        })
  >;
}
