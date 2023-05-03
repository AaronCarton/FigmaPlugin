export class Events {
  public static readonly INITIALIZE_DATA: string = "INITIALIZE_DATA";
  public static readonly DATA_INITIALIZED: string = "DATA_INITIALIZED";

  public static readonly CREATE_ANNOTATION: string = "CREATE_ANNOTATION";
  public static readonly ANNOTATION_CREATED: string = "ANNOTATION_CREATED";

  public static readonly UPDATE_ANNOTATION: string = "UPDATE_ANNOTATION";
  public static readonly TOGGLE_ANNOTATIONS: string = "TOGGLE_ANNOTATIONS";

  public static readonly FETCH_LOCAL_STORAGE: string = "FETCH_LOCAL_STORAGE";
  public static readonly LOCAL_STORAGE_FETCHED: string = "LOCAL_STORAGE_FETCHED";
  public static readonly SET_LOCAL_STORAGE: string = "SET_LOCAL_STORAGE";
  public static readonly FETCH_PROJECT_KEY: string = "FETCH_PROJECT_KEY";
  public static readonly PROJECT_KEY_FETCHED: string = "PROJECT_KEY_FETCHED";
}
