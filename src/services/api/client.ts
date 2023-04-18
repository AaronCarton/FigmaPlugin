import { ODSObject, ODSResponse } from "../../interfaces/ods/interface.ODSresponse";
import Annotation, { IAnnotation } from "../../interfaces/interface.annotation";
import Project, { IProject } from "../../interfaces/interface.project";
import APIError from "../../interfaces/ods/interface.APIerror";

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
  private static instance: ApiClient;
  public static BASE_URL: string;
  public static CLIENT_APIKEY: string;
  public static SOURCE_APIKEY: string;

  /**
   * Configure API client
   * @param {string} baseURL - Base URL of the ODS API
   * @param {string} clientKey - Client API key
   * @param {string} sourceKey - Source API key
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
      throw new Error("baseURL is required");
    }
    if (!clientKey) {
      throw new Error("clientKey is required");
    }
    if (!sourceKey) {
      throw new Error("sourceKey is required");
    }
  }

  ////////* API CALLS */ ///////

  /**
   * Search for projects
   * @param {string} projectKey - Key of the project to search for
   * @returns {Promise<Project>} - Promise that resolves to a project
   */
  public async getProject(projectKey: string): Promise<Project | null> {
    return this.getById<Project>("project", projectKey).then((res) =>
      res ? new Project(res, this) : null,
    );
  }

  /**
   * Search for annotations
   * @param {string} projectKey - Key of the project to search for
   * @param {boolean} includeArchived - Whether to include archived annotations in results
   * @returns {Promise<Annotation[]>} - Promise that resolves to an array of annotations
   */
  public async getAnnotations(projectKey: string, includeArchived = false): Promise<Annotation[]> {
    return this.searchItem<Annotation>(
      "annotation",
      `projectKey.eq.${projectKey}`,
      undefined,
      includeArchived,
    ).then((res) => res.results.map((res) => new Annotation(res.item, this)));
  }

  /**
   * Create a new annotation
   * @param {string} itemKey - Key under which the annotation will be stored
   * @param {IAnnotation} annotation - Annotation to create (should not contain ODS metadata)
   * @returns {Promise<Project>} - Promise that resolves to the created annotation
   */
  public async createAnnotation(itemKey: string, annotation: IAnnotation): Promise<Annotation> {
    // Create annotation
    return await this.upsertItem("annotation", itemKey, annotation as Annotation).then(() =>
      // Get annotation from ODS after creating it (needs to be done to get ODS metadata)
      this.getById<Annotation>("annotation", itemKey).then((res) => new Annotation(res!, this)),
    );
  }

  /**
   * Create a new project
   * @param {string} itemKey - Key under which the project will be stored
   * @param {IProject} project - Project to create (should not contain ODS metadata)
   * @returns {Promise<Project>} - Promise that resolves to the created project
   */
  public async createProject(itemKey: string, project: IProject): Promise<Project> {
    // Create project
    return await this.upsertItem("project", itemKey, project as Project).then(() =>
      // Get project from ODS after creating it (needs to be done to get ODS metadata)
      this.getById<Project>("project", itemKey).then((res) => new Project(res!, this)),
    );
  }

  ////////* HELPER FUNCTIONS *////////

  public async getById<Type extends ODSObject<Type>>(
    itemType: string,
    id: string,
  ): Promise<Type | null> {
    const res = await this.fetchData(`/api/items/${itemType}/null/${id}`, {
      method: "GET",
      apiKey: ApiClient.CLIENT_APIKEY,
    });

    if (res.status === 404) return null;
    const data = await res.json(); // Parse response as JSON
    const obj = { ...data, ...data._system }; // Merge ODS metadata with item data
    delete obj._system; // Remove ODS metadata key

    return obj as Type;
  }

  /**
   * Generic function to search for items in the ODS API
   * @template Type - Type of the item to search for (e.g. Annotation)
   * @template ParentType - Optional type of the parent object (e.g. Project)
   * @template ParentKey - Optional key under which the parent will be found (e.g. "project")
   * @param {string} itemType - Index of item to search for (e.g. "annotation")
   * @param {string} filter - Filter to apply to the search (e.g. projectKey.eq.123)
   * @param {string} parent - Optional parent (e.g. "project")
   */
  public async searchItem<
    Type extends ODSObject<Type>,
    ParentType = undefined,
    ParentKey extends string = "",
  >(
    itemType: string,
    filter: string,
    parent?: ParentKey,
    includeArchived?: boolean,
  ): Promise<ODSResponse<Type, ParentType, ParentKey>> {
    const res = await this.fetchData(`/api/search/${itemType}`, {
      method: "POST",
      apiKey: ApiClient.CLIENT_APIKEY,
      body: {
        filter: filter,
      },
      parent: parent,
      metadata: true,
      includeArchived: includeArchived,
    });

    return res.json();
  }

  /**
   * Generic function to upsert items in the ODS API
   * @template Type - Type of the item to upsert (e.g. Annotation)
   * @param {string} itemType - Index of item (e.g. "annotation")
   * @param {string} itemKey - Key of the item
   * @param {Type} body - Item to upsert
   */
  public async upsertItem<Type extends ODSObject<Type>>(
    itemType: string,
    itemKey: string,
    body: Type,
  ) {
    const res = await this.fetchData(`/api/items/${itemType}/null/${itemKey}`, {
      method: "PUT",
      apiKey: ApiClient.SOURCE_APIKEY,
      body: body,
      metadata: true,
    });
    return res.text(); // Update response are empty bodies
  }

  /**
   * Generic function to make API calls
   * @param {string} url - API endpoint
   * @param {RequestOptions} options - Request options
   * @returns {Promise<Response>} - Response object from fetch
   */
  private async fetchData(url: string, options: RequestOptions): Promise<Response> {
    const { method, body, apiKey, metadata } = options;

    // Create request
    console.debug(`[API] Request: ${method} ${url}`, body, "key:", apiKey);
    const res = await fetch(ApiClient.BASE_URL + url, {
      method: method,
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "x-include-metadata": metadata ? "true" : "false",
        "x-include-archived": options.includeArchived ? "true" : "false",
        "x-expand": options.parent || "",
      },
    });
    console.debug(`[API] Response: ${method} ${url}`, res);

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
