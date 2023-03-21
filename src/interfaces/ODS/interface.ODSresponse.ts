/**
 *  ODSresponse is a generic interface for the response from the ODS API.
 * @param T is the type of the item in the response (e.g. Annotation)
 * @param U is the type of an optional parent object in the response (e.g. Project)
 * @param K is the key under which the parent will be found (e.g. "project")
 */
export default interface ODSresponse<T, U = undefined, K extends string = ""> {
  results: Array<
    {
      item: T;
    } & (U extends undefined
      ? // eslint-disable-next-line @typescript-eslint/ban-types
        {}
      : {
          [P in K]: U;
        })
  >;
}
