import { Events } from "../services/events/Events";
import { AnnotationInput } from "./annotationInput";
import Annotation, { IAnnotation } from "./interface.annotation";
import { ODSFacet } from "./ods/interface.ODSresponse";

export interface InitializeOptions {
  baseURL: string;
  clientKey: string;
  sourceKey: string;
  filters: Filters;
}

export interface LocalStoragePayload {
  baseURL: string;
  clientKey: string;
  sourceKey: string;
}

export interface Filters {
  projectKey: string[];
  dataSource?: string[];
  entity?: string[];
  attribute?: string[];
  dataType?: string[];
  value?: string[];
}

export interface FigmaMessage {
  message: string;
  /**
   * Whether to show a notification as an info or error
   * @default "ERROR"
   */
  type?: "INFO" | "ERROR";
  /**
   * How long to show the notification for
   * @default 5000
   */
  duration?: number;
  /** Whether to cancel any current notifications to avoid stacking them in a queue
   * @default false
   */
  cancelPrevious?: boolean;
}

export interface EventMap {
  [Events.INITIALIZE_DATA]: InitializeOptions;
  [Events.ANNOTATIONS_FETCHED]: Annotation[];
  [Events.FACETS_FETCHED]: ODSFacet[];

  [Events.UPSERT_ANNOTATION]: IAnnotation;
  [Events.ANNOTATION_UPSERTED]: IAnnotation;
  [Events.DRAW_ANNOTATION]: Annotation;

  [Events.INIT_ARCHIVE_ANNOTATION]: IAnnotation;
  [Events.ARCHIVE_ANNOTATION]: IAnnotation;
  [Events.ANNOTATION_ARCHIVED]: Annotation;

  [Events.TOGGLE_ANNOTATIONS]: null;
  [Events.FETCH_LOCAL_STORAGE]: null;
  [Events.LOCAL_STORAGE_FETCHED]: LocalStoragePayload;
  [Events.SET_LOCAL_STORAGE]: LocalStoragePayload;
  [Events.FETCH_PROJECT_KEY]: null;
  [Events.PROJECT_KEY_FETCHED]: string;
  [Events.FIGMA_MESSAGE]: FigmaMessage;
  [Events.API_ERROR]: string;

  [Events.UI_INITIALIZE_COMPONENT]: string;
  [Events.UI_CHANGE_TAB]: { tab: string; connection: boolean };
  [Events.UI_CHANGE_VISIBILITY]: boolean;
  [Events.UI_CHANGE_FILTER]: number;
  [Events.UI_REMOVE_FILTER]: number;
  [Events.UI_UPDATE_FIELDS]: AnnotationInput;
  [Events.UI_CLEAR_FIELDS]: null;
  [Events.UI_SHOW_MORE]: { tab: string; isShowMoreActive: boolean };
  [Events.UI_RESET_TEXTAREA_SIZE]: null;

  [Events.SET_SAMPLE_VALUE_FROM_FIGMANODE]: string;
  [Events.UPDATE_NODETEXT_FROM_ODS]: string;
  [Events.UPDATE_ANNOTATION_BY_TEXTNODE]: { textNodeCharacters: string; annotation: Annotation };

  // Default option
  [key: string]: unknown;
}
