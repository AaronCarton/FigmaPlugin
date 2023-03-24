import ApiClient from "../../services/api/client";

/**
 *  ODSresponse is a generic interface for the response from the ODS API.
 * @param T is the type of the item in the response (e.g. Annotation)
 * @param U is the type of an optional parent object in the response (e.g. Project)
 * @param K is the key under which the parent will be found (e.g. "project")
 */
export interface ODSResponse<T extends ODSObject<T>, U = undefined, K extends string = ""> {
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

/**
 * ODSObject is an abstract generic class for the objects returned by the ODS API.
 * As all objects will include these properties.
 *
 * It also includes some helper functions, such as saving and archiving.
 *
 * IT IS NOT MEANT TO BE INSTANTIATED DIRECTLY.
 */
export abstract class ODSObject<T extends ODSObject<T>> {
  protected API: ApiClient;

  public itemType: string;
  public partition: string;
  public itemKey: string;
  public localized: [];
  public deleted: boolean;

  constructor(api: ApiClient, obj: T) {
    this.API = api;

    this.itemType = obj.itemType;
    this.partition = obj.partition;
    this.itemKey = obj.itemKey;
    this.localized = obj.localized;
    this.deleted = obj.deleted;
  }

  /**
   * Archive the item
   *
   * sets the deleted property to true and calls save()
   */
  public async archive() {
    this.deleted = true;
    this.save();
  }

  /**
   * Restore the item
   *
   * sets the deleted property to false and calls save()
   */
  public async restore() {
    this.deleted = false;
    this.save();
  }

  /**
   * Save the item
   */
  public async save() {
    await this.API.upsertItem(this.itemType, this.itemKey, this.stripODS());
  }

  /**
   * stripODS() removes the ODSobject properties from the child object
   * and returns a new object without them.
   * This is necessary because the ODS API does not accept
   * these additional properties when updating an object.
   *
   * @returns {T} a new object without the ODS properties
   */
  public stripODS(): T {
    const x = { ...this } as Record<string, unknown>;
    delete x.API;
    delete x.itemKey;
    delete x.itemType;
    delete x.localized;
    delete x.partition;

    return x as T;
  }
}
