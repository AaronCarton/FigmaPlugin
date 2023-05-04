import ApiClient from "../../services/api/client";

/**
 * ODSresponse is a generic interface for the response from the ODS API.
 * @param T is the type of the item in the response (e.g. Annotation)
 * @param U is the type of an optional parent object in the response (e.g. Project)
 * @param K is the key under which the parent will be found (e.g. "project")
 * @example ODSResponse<Annotation, Project, "project"> // Annotation with Project as parent, which will be found under "project" key in results
 */
export interface ODSResponse<T extends ODSObject<T>, U = undefined, K extends string = ""> {
  filter: string;
  page: number;
  pageSize: number;
  totalPageCount: number;
  totalItemCount: number;
  facets: ODSFacet[];
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

export interface ODSFacetValues {
  key: string;
  displayName: string;
  value: string;
  count: number;
  countText: string;
  selected: boolean;
  sortKey: string;
}

export interface ODSFacet {
  name: string;
  displayName: string;
  description: string;
  totalValueCount: number;
  values: ODSFacetValues[];
}

/**
 * ODSObject is an abstract generic class for the objects returned by the ODS API.
 * As all objects will include these properties.
 *
 * It also includes some helper functions, such as saving and archiving.
 *
 * IT IS NOT MEANT TO BE INSTANTIATED DIRECTLY.
 *
 * @param T - Child class that extends ODSObject (e.g. Annotation)
 * @example class Annotation extends ODSObject<Annotation> { ... }
 */
export abstract class ODSObject<T extends ODSObject<T>> {
  public itemType: string;
  public partition: string;
  public itemKey: string;
  public localized: [];
  public archived: string | null;

  constructor(obj: T) {
    this.itemType = obj.itemType;
    this.partition = obj.partition;
    this.itemKey = obj.itemKey;
    this.localized = obj.localized;
    this.archived = obj.archived;
  }

  /**
   * Archive the item
   *
   * sets the deleted property to true and calls save()
   */
  public async archive() {
    this.archived = new Date().toISOString(); // save the current date as ISO string
  }

  /**
   * Restore the item
   *
   * sets the deleted property to false and calls save()
   */
  public async restore() {
    this.archived = null; // remove archived property
  }
}

/**
 * stripODS() removes the ODSobject properties from the child object
 * and returns a new object without them.
 * This is necessary because the ODS API does not accept
 * these additional properties when updating an object.
 *
 * @param obj - the object to strip
 * @returns {T} a new object without the ODS properties
 */
export function stripODS<T extends ODSObject<T>>(obj: T): T {
  const x = { ...obj } as Record<string, unknown>;
  delete x.API;
  delete x.itemKey;
  delete x.itemType;
  delete x.localized;
  delete x.partition;

  return x as T;
}
