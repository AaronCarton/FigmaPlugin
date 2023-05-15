export class Events {
  public static readonly INITIALIZE_DATA: string = "INITIALIZE_DATA";
  public static readonly ANNOTATIONS_FETCHED: string = "ANNOTATIONS_FETCHED";
  public static readonly FACETS_FETCHED: string = "FACETS_FETCHED";

  public static readonly UPSERT_ANNOTATION: string = "UPSERT_ANNOTATION";
  public static readonly ANNOTATION_UPSERTED: string = "ANNOTATION_UPSERTED";
  public static readonly DRAW_ANNOTATION: string = "DRAW_ANNOTATION";

  public static readonly UPDATE_ANNOTATION: string = "UPDATE_ANNOTATION";
  public static readonly TOGGLE_ANNOTATIONS: string = "TOGGLE_ANNOTATIONS";

  public static readonly INIT_ARCHIVE_ANNOTATION: string = "INIT_ARCHIVE_ANNOTATION";
  public static readonly ARCHIVE_ANNOTATION: string = "ARCHIVE_ANNOTATION";
  public static readonly ANNOTATION_ARCHIVED: string = "ANNOTATION_ARCHIVED";

  public static readonly FETCH_LOCAL_STORAGE: string = "FETCH_LOCAL_STORAGE";
  public static readonly LOCAL_STORAGE_FETCHED: string = "LOCAL_STORAGE_FETCHED";
  public static readonly SET_LOCAL_STORAGE: string = "SET_LOCAL_STORAGE";
  public static readonly FETCH_PROJECT_KEY: string = "FETCH_PROJECT_KEY";
  public static readonly PROJECT_KEY_FETCHED: string = "PROJECT_KEY_FETCHED";

  public static readonly SET_SAMPLE_VALUE_FROM_FIGMANODE: string = "SET_SAMPLE_VALUE_FROM_FIGMA";
  public static readonly UPDATE_NODETEXT_FROM_ODS: string = "UPDATE_NODETEXT_FROM_ODS";
  public static readonly UPDATE_ANNOTATION_BY_TEXTNODE: string = "UPDATE_ANNOTATION_BY_TEXTNODE";

  public static readonly FIGMA_ERROR: string = "FIGMA_ERROR";

  public static readonly API_ERROR: string = "API_ERROR";
}
