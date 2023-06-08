import { ODSObject, ODSResponse, stripODS } from "../../interfaces/ods/interface.ODSresponse";
import Annotation, { IAnnotation } from "../../interfaces/interface.annotation";
import Project, { IProject } from "../../interfaces/interface.project";
import { Filters } from "../../interfaces/interface.EventHub";
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
  public static ods_annotations: Array<Annotation> = [];

  public static initializeEvents() {
    const eventHub = EventHub.getInstance();

    // Initialize API client
    eventHub.makeEvent(Events.INITIALIZE_DATA, async ({ baseURL, clientKey, sourceKey, filters }) => {
      ApiClient.resetClient(); // Reset client first if already initialized

      const api = ApiClient.initialize({
        baseURL,
        clientKey,
        sourceKey,
      });

      eventHub.sendCustomEvent(Events.FIGMA_MESSAGE, { message: "Validating credentials...", type: "INFO", duration: 3000, cancelPrevious: true });

      const results = await api.validateODSCredentials();
      // if client or source key is false, send error message
      if (!results.client || !results.source) {
        const invalidKeys = Object.entries(results)
          .filter(([, value]) => !value)
          .map(([key]) => key);
        EventHub.getInstance().sendCustomEvent(
          Events.API_ERROR,
          `The API ${invalidKeys.join(" and ")} key ${invalidKeys.length > 1 ? " are" : " is"} invalid. Please check your credentials.`,
        );
        return;
      }
      api
        .getProject(filters.projectKey?.at(0) || "")
        .then(() => {
          eventHub.sendCustomEvent(Events.FIGMA_MESSAGE, { message: "Fetching annotations...", type: "INFO", duration: 3000, cancelPrevious: true });
          api.searchItem<Annotation>(PropertizeConstants.annotation, filters, PropertizeConstants.searchItemProperties).then((response) => {
            const annotations = response.results.map((res) => new Annotation(res.item));
            ApiClient.ods_annotations = annotations; // Store annotations in cache
            EventHub.getInstance().sendCustomEvent(Events.ANNOTATIONS_FETCHED, annotations);
            EventHub.getInstance().sendCustomEvent(Events.FACETS_FETCHED, response.facets);
          });
        })
        .catch((error) => {
          //API source key error
          if (error instanceof APIError) {
            EventHub.getInstance().sendCustomEvent(Events.API_ERROR, error.message);
          }
        });
    });

    eventHub.makeEvent(Events.APPLY_FILTERS, async (filters: Filters) => {
      ApiClient.getInstance()
        .searchItem<Annotation>(PropertizeConstants.annotation, filters, PropertizeConstants.searchItemProperties)
        .then((response) => {
          const annotations = response.results.map((res) => new Annotation(res.item));
          ApiClient.ods_annotations = annotations; // Store annotations in cache
          EventHub.getInstance().sendCustomEvent(Events.ANNOTATIONS_FETCHED, annotations);
          EventHub.getInstance().sendCustomEvent(Events.FACETS_FETCHED, response.facets);
        });
    });

    eventHub.makeEvent(Events.UPDATE_ANNOTATION_BY_TEXTNODE, (message: any) => {
      const index = ApiClient.ods_annotations.findIndex((annotation) => annotation.nodeId === message.annotation.nodeId);
      if (index !== -1) {
        const foundAnno = ApiClient.ods_annotations[index];
        // Update existing annotation
        foundAnno.value = message.textNodeCharacters;
        // Update annotation in cache
        ApiClient.ods_annotations[index] = foundAnno;
        // Update annotation in ODS
        ApiClient.getInstance()
          .upsertItem(foundAnno.itemType, foundAnno.itemKey, stripODS(foundAnno))
          .then(() => {
            EventHub.getInstance().sendCustomEvent(Events.DRAW_ANNOTATION, foundAnno);
          });
      }
    });

    // Register create listener
    eventHub.makeEvent(Events.ANNOTATION_UPSERTED, async (obj: IAnnotation) => {
      // Check if annotation already exists
      const index = ApiClient.ods_annotations.findIndex((annotation) => annotation.nodeId === obj.nodeId);
      if (index !== -1) {
        const foundAnno = ApiClient.ods_annotations[index];
        // Update existing annotation
        foundAnno.dataSource = obj.dataSource;
        foundAnno.dataType = obj.dataType;
        foundAnno.entity = obj.entity;
        foundAnno.attribute = obj.attribute;
        foundAnno.value = obj.value;
        // Update annotation in cache
        ApiClient.ods_annotations[index] = foundAnno;
        // Update annotation in ODS
        ApiClient.getInstance()
          .upsertItem(foundAnno.itemType, foundAnno.itemKey, stripODS(foundAnno))
          .then(() => {
            EventHub.getInstance().sendCustomEvent(Events.DRAW_ANNOTATION, foundAnno);
            EventHub.getInstance().sendCustomEvent(Events.UPDATE_NODETEXT_FROM_ODS, foundAnno.value);
          });
      } else {
        ApiClient.getInstance()
          .createAnnotation(generateUUID(), obj)
          .then((annotation) => {
            ApiClient.ods_annotations.push(annotation); // Add annotation to cache
            EventHub.getInstance().sendCustomEvent(Events.UPDATE_NODETEXT_FROM_ODS, annotation.value);
            EventHub.getInstance().sendCustomEvent(Events.DRAW_ANNOTATION, annotation);
          });
      }
    });

    eventHub.makeEvent(Events.ARCHIVE_ANNOTATION, (obj: IAnnotation) => {
      const index = ApiClient.ods_annotations.findIndex((annotation) => annotation.nodeId === obj.nodeId);

      if (index !== -1) {
        const foundAnno = ApiClient.ods_annotations[index];
        ApiClient.ods_annotations[index].archived = new Date().toISOString();
        ApiClient.getInstance()
          .upsertItem(foundAnno.itemType, foundAnno.itemKey, stripODS(foundAnno))
          .then(() => {
            ApiClient.ods_annotations.splice(index, 1); // Remove annotation from cache
            EventHub.getInstance().sendCustomEvent(Events.ANNOTATION_ARCHIVED, foundAnno);
          });
      }
    });
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
    //// EventHub.getInstance().removeEvent(Events.ANNOTATION_UPSERTED);
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
    return this.searchItem<Annotation>(PropertizeConstants.annotation, { projectKey: [projectKey] }, undefined, undefined, includeArchived).then(
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
   * Test the client and source API keys
   * @returns {Promise<{client: boolean, source: boolean}>} - Promise that resolves to an object containing the results of the test
   */
  public async validateODSCredentials(): Promise<{ client: boolean; source: boolean }> {
    const clientRes = await this.fetchData("/api/propertize/test/propertize/authenticated", {
      method: "GET",
      apiKey: ApiClient.CLIENT_APIKEY,
    });

    const sourceRes = await this.fetchData("/api/propertize/test/propertize/authenticated", {
      method: "GET",
      apiKey: ApiClient.SOURCE_APIKEY,
    });

    return { client: clientRes.status !== 401, source: sourceRes.status !== 401 };
  }

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
    filter: Filters,
    facets?: string[],
    parent?: ParentKey,
    includeArchived?: boolean,
  ): Promise<ODSResponse<Type, ParentType, ParentKey>> {
    // Construct filters, converts {projectKey: ["123"]} to "projectKey.eq.123"
    const filterString = Object.entries(filter).map(([key, value], i) => {
      const fValue = value.length > 1 ? `any(${value.join(",")})` : value[0]; // If multiple values, use .any() filter
      return (i > 0 ? "/" : "") + `${key}.eq.${fValue}`;
    });

    return await this.fetchData(`/api/search/${itemType}`, {
      method: "POST",
      apiKey: ApiClient.CLIENT_APIKEY,
      body: {
        filter: filterString.join(""),
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
      console.error("[API] Fetch Error", err);
      if (err instanceof TypeError && err.message === "Failed to fetch")
        // If URL is invalid or server is down
        EventHub.getInstance().sendCustomEvent(Events.API_ERROR, "Failed to connect to database, please check your database URL");
      // Else a more generic error
      else EventHub.getInstance().sendCustomEvent(Events.API_ERROR, err.message);

      throw err;
    });
    console.debug(`[API] Response: ${method} ${url}`, res);

    // Error handling
    if (!res.ok) {
      switch (res.status) {
        case 404:
          break; // Not found should not throw an error, just return null (see getById)
        case 401:
          break; // Unauthorized requests will be handled by the checkCredentials function
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
