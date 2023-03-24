import { ODSObject, ODSResponse } from "../../interfaces/ods/interface.ODSresponse";
import Annotation from "../../interfaces/interface.annotation";
import Project from "../../interfaces/interface.project";
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
}

export default class ApiClient {
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
    this.checkInitialized({ baseURL, clientKey, sourceKey });

    this.BASE_URL = baseURL;
    this.CLIENT_APIKEY = clientKey;
    this.SOURCE_APIKEY = sourceKey;

    return new ApiClient();
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

  ////////* API CALLS *////////

  /**
   * Search for projects
   * @param {string} projectKey - Key of the project to search for
   * @returns {Promise<Project[]>} - Promise that resolves to an array of projects
   */
  public async getProject(projectKey: string): Promise<Project[]> {
    return this.searchItem<Project>("project", `projectKey.eq${projectKey}`).then((res) =>
      res.results.map((res) => new Project(res.item, this)),
    );
  }

  /**
   * Search for annotations
   * @param {string} projectKey - Key of the project to search for
   * @param {boolean} showDeleted - Whether to show deleted annotations
   * @returns {Promise<Annotation[]>} - Promise that resolves to an array of annotations
   */
  async getAnnotations(projectKey: string, showDeleted = false): Promise<Annotation[]> {
    return this.searchItem<Annotation>(
      "annotation",
      `projectKey.eq.${projectKey}` + (showDeleted ? "" : "/deleted.eq.false"),
    ).then((res) => res.results.map((res) => new Annotation(res.item, this)));
  }

  ////////* HELPER FUNCTIONS *////////

  /**
   * Generic function to search for items in the ODS API
   * @template Type Type of the item to search for (e.g. Annotation)
   * @template ParentType Optional type of the parent object (e.g. Project)
   * @template ParentKey Optional key under which the parent will be found (e.g. "project")
   * @param {string} itemType index of item to search for (e.g. "annotation")
   * @param {string} filter filter to apply to the search (e.g. projectKey.eq.123)
   * @param {string} parent optional parent (e.g. "project")
   */
  public async searchItem<
    Type extends ODSObject<Type>,
    ParentType = undefined,
    ParentKey extends string = "",
  >(
    itemType: string,
    filter: string,
    parent?: ParentKey,
  ): Promise<ODSResponse<Type, ParentType, ParentKey>> {
    const res = await this.fetchData(`/api/search/${itemType}`, {
      method: "POST",
      apiKey: ApiClient.CLIENT_APIKEY,
      body: {
        filter: filter,
      },
      parent: parent,
      metadata: true,
    });

    return res.json();
  }

  /**
   * Generic function to upsert items in the ODS API
   * @template Type Type of the item to upsert (e.g. Annotation)
   * @param {string} itemType index of item (e.g. "annotation")
   * @param {string} itemKey key of the item
   * @param {Type} body the item to upsert
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
        "x-expand": options.parent || "",
      },
    });
    console.debug(`[API] Response: ${method} ${url}`, res);

    // Error handling
    if (!res.ok) {
      switch (res.status) {
        case 404:
          throw new APIError(res, "API URL not found, please check your URL");
        case 401:
          throw new APIError(res, "Unauthorized, please check your API key");
        case 500:
          throw new APIError(res, "Internal Server Error");
        default:
          throw new APIError(res, "Something went wrong, please try again later");
      }
    }

    return res;
  }
}
