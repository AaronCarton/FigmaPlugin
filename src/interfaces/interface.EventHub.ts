import { Events } from "../services/events/Events";
import { AnnotationInput } from "./annotationInput";
import Annotation, { IAnnotation } from "./interface.annotation";
import { ODSFacet } from "./ods/interface.ODSresponse";

export interface InitializeOptions {
  projectKey: string;
  baseURL: string;
  clientKey: string;
  sourceKey: string;
}

export interface LocalStoragePayload {
  baseURL: string;
  clientKey: string;
  sourceKey: string;
}

export interface EventMap {
  [Events.INITIALIZE_DATA]: InitializeOptions;
  [Events.ANNOTATIONS_FETCHED]: Annotation[];
  [Events.FACETS_FETCHED]: ODSFacet[];

  [Events.UPSERT_ANNOTATION]: IAnnotation;
  [Events.ANNOTATION_UPSERTED]: IAnnotation;
  [Events.DRAW_ANNOTATION]: Annotation;

  [Events.TOGGLE_ANNOTATIONS]: null;
  [Events.FETCH_LOCAL_STORAGE]: null;
  [Events.LOCAL_STORAGE_FETCHED]: LocalStoragePayload;
  [Events.SET_LOCAL_STORAGE]: LocalStoragePayload;
  [Events.FETCH_PROJECT_KEY]: null;
  [Events.PROJECT_KEY_FETCHED]: string;

  [Events.UI_INITIALIZE_COMPONENT]: string;
  [Events.UI_CHANGE_TAB]: { tab: string; connection: boolean };
  [Events.UI_CHANGE_VISIBILITY]: boolean;
  [Events.UI_UPDATE_FIELDS]: AnnotationInput;
  [Events.UI_CLEAR_FIELDS]: null;
}

export interface EventHub {
  sendCustomEvent<T extends Events>(eventType: T, message: EventMap[T], suppressLog?: boolean): void;
  makeEvent<T extends Events>(eventType: T, cb: (message: EventMap[T]) => void): void;
}
