export enum Events {
  //////////* ANNOTATIONS EVENTS *//////////
  INITIALIZE_DATA = "INITIALIZE_DATA",
  ANNOTATIONS_FETCHED = "ANNOTATIONS_FETCHED",
  FACETS_FETCHED = "FACETS_FETCHED",

  UPSERT_ANNOTATION = "UPSERT_ANNOTATION",
  ANNOTATION_UPSERTED = "ANNOTATION_UPSERTED",
  DRAW_ANNOTATION = "DRAW_ANNOTATION",

  INIT_ARCHIVE_ANNOTATION = "INIT_ARCHIVE_ANNOTATION",
  ARCHIVE_ANNOTATION = "ARCHIVE_ANNOTATION",
  ANNOTATION_ARCHIVED = "ANNOTATION_ARCHIVED",

  //////////* MISC EVENTS *//////////
  TOGGLE_ANNOTATIONS = "TOGGLE_ANNOTATIONS",
  FETCH_LOCAL_STORAGE = "FETCH_LOCAL_STORAGE",
  LOCAL_STORAGE_FETCHED = "LOCAL_STORAGE_FETCHED",
  SET_LOCAL_STORAGE = "SET_LOCAL_STORAGE",
  FETCH_PROJECT_KEY = "FETCH_PROJECT_KEY",
  PROJECT_KEY_FETCHED = "PROJECT_KEY_FETCHED",
  FIGMA_ERROR = "FIGMA_ERROR",
  API_ERROR = "API_ERROR",

  //////////* UI EVENTS *//////////
  UI_INITIALIZE_COMPONENT = "UI_INITIALIZE_COMPONENT",
  UI_CHANGE_TAB = "UI_CHANGE_TAB",
  UI_CHANGE_VISIBILITY = "UI_CHANGE_VISIBILITY",
  UI_UPDATE_FIELDS = "UI_UPDATE_FIELDS",
  UI_CLEAR_FIELDS = "UI_CLEAR_FIELDS",

  SET_SAMPLE_VALUE_FROM_FIGMANODE = "SET_SAMPLE_VALUE_FROM_FIGMA",
  UPDATE_NODETEXT_FROM_ODS = "UPDATE_NODETEXT_FROM_ODS",
  UPDATE_ANNOTATION_BY_TEXTNODE = "UPDATE_ANNOTATION_BY_TEXTNODE",
}
