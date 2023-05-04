import { ODSObject, ODSResponse, stripODS } from "../../interfaces/ods/interface.ODSresponse";
import Annotation, { IAnnotation } from "../../interfaces/interface.annotation";
import Project, { IProject } from "../../interfaces/interface.project";
import APIError from "../../interfaces/ods/interface.APIerror";
import EventHub from "../events/EventHub";
import { Events } from "../events/Events";
import { PropertizeConstants } from "../../classes/propertizeConstants";
import generateUUID from "../../functions/generateUUID";

interface ApiOptions {
  baseURL: string;
  clientKey: string;
  sourceKey: string;
}

interface RequestOptions {
  method: "GET" | "PUT" | "POST" | "DELETE";
  apiKey: string;
  body?: object;
  metadata?: boolean;
  parent?: string;
  includeArchived?: boolean;
}

export default class ApiClient {
  private static instance: ApiClient | undefined;
  public static BASE_URL: string;
  public static CLIENT_APIKEY: string;
  public static SOURCE_APIKEY: string;

  public static initializeEvents() {
    const eventHub = EventHub.getInstance();

    // Initialize API client
    eventHub.makeEvent(Events.INITIALIZE_DATA, ({ projectKey, baseURL, clientKey, sourceKey }) => {
      ApiClient.resetClient(); // Reset client first if already initialized

      const api = ApiClient.initialize({
        baseURL,
        clientKey,
        sourceKey,
      });

      api.getProject(projectKey).then((project) => {
        api
          .searchItem<Annotation>(PropertizeConstants.annotation, `projectKey.eq.${project?.itemKey}`, PropertizeConstants.searchItemProperties)
          .then((response) => {
            const annotations = response.results.map((res) => new Annotation(res.item));
            EventHub.getInstance().sendCustomEvent(Events.ANNOTATIONS_FETCHED, annotations);
            EventHub.getInstance().sendCustomEvent(Events.FACETS_FETCHED, response.facets);
          });
      });
    });

    // Register create listener
    eventHub.makeEvent(Events.ANNOTATION_CREATED, async (obj: IAnnotation) => {
      ApiClient.getInstance()
        .createAnnotation(generateUUID(), obj)
        .then((annotation) => {
          EventHub.getInstance().sendCustomEvent(Events.DRAW_ANNOTATION, annotation);
        });
    });

    // Register update listener
    eventHub.makeEvent(Events.UPDATE_ANNOTATION, async (obj: Annotation) => {
      await ApiClient.getInstance().upsertItem(obj.itemType, obj.itemKey, stripODS(obj));
    });
    // TODO: add ARCHIVE and UNARCHIVE listeners
  }

  /**
   * Configure API client
   * @param {ApiOptions} options - Options to configure the API client
   * @param {string} options.baseURL - Base URL of the ODS API
   * @param {string} options.clientKey - Client API key
   * @param {string} options.sourceKey - Source API key
   */
  public static initialize({ baseURL, clientKey, sourceKey }: ApiOptions) {
    // Return existing instance if already initialized
    if (ApiClient.instance) return ApiClient.instance;

    // Create new instance, store it, and return it
    this.checkInitialized({ baseURL, clientKey, sourceKey });
    this.BASE_URL = baseURL;
    this.CLIENT_APIKEY = clientKey;
    this.SOURCE_APIKEY = sourceKey;
    ApiClient.instance = new ApiClient();

    return ApiClient.instance;
  }

  public static resetClient() {
    // Reset API instance
    ApiClient.instance = undefined;
    ApiClient.BASE_URL = "";
    ApiClient.CLIENT_APIKEY = "";
    ApiClient.SOURCE_APIKEY = "";
    // Remove listeners
    EventHub.getInstance().removeEvent(Events.CREATE_ANNOTATION);
    EventHub.getInstance().removeEvent(Events.UPDATE_ANNOTATION);
  }

  /**
   * Get the API client instance
   * @throws If the API client has not been initialized
   */
  public static getInstance() {
    if (!ApiClient.instance) throw new Error("ApiClient has not been initialized");
    return ApiClient.instance;
  }

  private static checkInitialized({ baseURL, clientKey, sourceKey }: ApiOptions) {
    if (ApiClient.BASE_URL) {
      throw new Error("ApiClient has already been initialized");
    }
    if (!baseURL) {
      throw new Error("BaseURL is required.");
    }
    if (!clientKey) {
      throw new Error("ClientKey is required");
    }
    if (!sourceKey) {
      throw new Error("SourceKey is required");
    }

    console.log("ApiClient initialized: baseURL: %s, clientKey: %s, sourceKey: %s", baseURL, clientKey, sourceKey); // TODO: Remove
  }

  ////////* API CALLS */ ///////

  /**
   * Search for projects
   * @param {string} projectKey - Key of the project to search for
   * @param {boolean} includeArchived - Whether to return an archived project if it exists
   * @returns {Promise<Project>} - Promise that resolves to a project
   */
  public async getProject(projectKey: string, includeArchived: boolean = false): Promise<Project | null> {
    return this.getById<Project>("project", projectKey, includeArchived).then((res) =>
      res
        ? new Project(res)
        : this.createProject(projectKey, {
            lastUpdated: new Date().toISOString(),
            customerId: projectKey,
          }),
    );
  }

  /**
   * Search for annotations
   * @param {string} projectKey - Key of the project to search for
   * @param {boolean} includeArchived - Whether to include archived annotations in results
   * @returns {Promise<Annotation[]>} - Promise that resolves to an array of annotations
   */
  public async getAnnotations(projectKey: string, includeArchived = false): Promise<Annotation[]> {
    return this.searchItem<Annotation>(PropertizeConstants.annotation, `projectKey.eq.${projectKey}`, undefined, undefined, includeArchived).then(
      (res) => res.results.map((res) => new Annotation(res.item)),
    );
  }

  /**
   * Create a new annotation
   * @param {string} itemKey - Key under which the annotation will be stored
   * @param {IAnnotation} annotation - Annotation to create (should not contain ODS metadata)
   * @returns {Promise<Project>} - Promise that resolves to the created annotation
   */
  public async createAnnotation(itemKey: string, annotation: IAnnotation): Promise<Annotation> {
    return await this.upsertItem(PropertizeConstants.annotation, itemKey, annotation as Annotation).then(
      () => new Annotation({ ...annotation, itemKey, itemType: PropertizeConstants.annotation } as Annotation),
    );
  }

  /**
   * Create a new project
   * @param {string} itemKey - Key under which the project will be stored
   * @param {IProject} project - Project to create (should not contain ODS metadata)
   * @returns {Promise<Project>} - Promise that resolves to the created project
   */
  public async createProject(itemKey: string, project: IProject): Promise<Project> {
    return await this.upsertItem(PropertizeConstants.project, itemKey, project as Project).then(
      () => new Project({ ...project, itemKey, itemType: PropertizeConstants.project } as Project),
    );
  }

  ////////* HELPER FUNCTIONS *////////

  /**
   * Generic function that fetches item by ID (skips Elasticsearch indexing)
   * @template Type - Type of the item to search for (e.g. Project)
   * @param {string} itemType - Type of the item to search for (e.g. project)
   * @param {string} id - ID of the item to search for
   * @param {boolean} includeArchived - Whether to include archived items in results
   */
  public async getById<T extends ODSObject<T>>(itemType: string, id: string, includeArchived = false): Promise<T | null> {
    const res = await this.fetchData(`/api/items/${itemType}/null/${id}`, {
      method: "GET",
      apiKey: ApiClient.CLIENT_APIKEY,
    });

    if (res.status === 404) return null;
    const data = await res.json(); // Parse response as JSON
    const m = { ...data._system };
    delete data._system; // Remove ODS metadata key
    // Merge ODS metadata with item data
    const obj = {
      ...data,
      itemKey: m.key,
      itemType: m.type,
      locale: m.locale,
      partition: m.partition,
    } as T;

    return obj.archived && !includeArchived ? null : obj;
  }

  /**
   * Generic function to search for items in the ODS API
   * @template Type - Type of the item to search for (e.g. Annotation)
   * @template ParentType - Optional type of the parent object (e.g. Project)
   * @template ParentKey - Optional key under which the parent will be found (e.g. "project")
   * @param {string} itemType - Index of item to search for (e.g. "annotation")
   * @param {string} filter - Filter to apply to the search (e.g. projectKey.eq.123)
   * @param {string[]} facets - Optional facets to include in the response (e.g. ["dataType", "entity"])
   * @param {string} parent - Optional parent (e.g. "project")
   * @param {boolean} includeArchived - Whether to include archived items in results
   */
  public async searchItem<Type extends ODSObject<Type>, ParentType = undefined, ParentKey extends string = "">(
    itemType: string,
    filter: string,
    facets?: string[],
    parent?: ParentKey,
    includeArchived?: boolean,
  ): Promise<ODSResponse<Type, ParentType, ParentKey>> {
    return await this.fetchData(`/api/search/${itemType}`, {
      method: "POST",
      apiKey: ApiClient.CLIENT_APIKEY,
      body: {
        filter: filter,
        facets: facets?.map((f) => ({ attribute: f })),
      },
      parent: parent,
      metadata: true,
      includeArchived: includeArchived,
    }).then((res) => res.json());
  }

  /**
   * Generic function to upsert items in the ODS API
   * @template Type - Type of the item to upsert (e.g. Annotation)
   * @param {string} itemType - Index of item (e.g. "annotation")
   * @param {string} itemKey - Key of the item
   * @param {Type} body - Item to upsert
   */
  public async upsertItem<Type extends ODSObject<Type>>(itemType: string, itemKey: string, body: Type) {
    const res = await this.fetchData(`/api/items/${itemType}/null/${itemKey}`, {
      method: "PUT",
      apiKey: ApiClient.SOURCE_APIKEY,
      body: body,
      metadata: true,
    });

    // Update response are empty bodies, but it might still return a validation error.
    return res.text();
  }

  /**
   * Generic function to make API calls
   * @param {string} url - API endpoint
   * @param {RequestOptions} options - Request options
   * @returns {Promise<Response>} - Response object from fetch
   */
  private async fetchData(url: string, options: RequestOptions): Promise<Response> {
    const { method, body, apiKey, metadata } = options;

    const headers = {
      "Content-Type": "application/json",
      "x-api-key": apiKey || "",
      "x-include-metadata": metadata ? "true" : "false",
      "x-include-archived": options.includeArchived ? "true" : "false",
      "x-expand": options.parent || "",
      "Access-Control-*": "*",
    };

    // Create request
    console.debug(`[API] Request: ${method} ${url}`, body, "key:", apiKey);
    const res = await fetch(ApiClient.BASE_URL + url, {
      method: method,
      body: JSON.stringify(body),
      headers: headers,
    }).catch((err) => {
      console.error("[API] Fetch Error", err); // temporary - remove later
      throw err;
    });
    console.debug(`[API] Response: ${method} ${url}`, res); // temporary - remove later

    // Error handling
    if (!res.ok) {
      switch (res.status) {
        case 404:
          break; // Not found should not throw an error, just return null (see getById)
        case 401:
          throw new APIError(res, "Unauthorized, please check your API key");
        case 400:
          throw new APIError(res, "Bad request, is the item structure correct?");
        case 500:
          throw new APIError(res, "Internal Server Error");
        default:
          throw new APIError(res, "Something went wrong, please try again later");
      }
    }

    return res;
  }
}
