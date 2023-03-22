import Annotation, { IAnnotation } from "../../interfaces/interface.annotation";
import Project from "../../interfaces/interface.project";
import APIError from "../../interfaces/ods/interface.APIerror";
import ODSresponse from "../../interfaces/ods/interface.ODSresponse";
import convertODSchild from "../../utils/convertODSchild";

let BASE_URL: string;
let CLIENT_APIKEY: string;
let SOURCE_APIKEY: string;

interface RequestOptions<K> {
  method: "GET" | "PUT" | "POST" | "DELETE";
  apiKey: string;
  body?: object;
  metadata?: boolean;
  parent?: K;
}

export default () => {
  /**
   * Configure API client
   * @param {string} baseURL - Base URL of the ODS API
   * @param {string} clientKey - Client API key
   * @param {string} sourceKey - Source API key
   */
  const initializeClient = async (baseURL: string, clientKey: string, sourceKey: string) => {
    BASE_URL = baseURL;
    CLIENT_APIKEY = clientKey;
    SOURCE_APIKEY = sourceKey;
  };

  /**
   * Generic function to make API calls
   * @template T - Optional type of returned data. If not provided, a string will be returned.
   * @template U - Optional type of parent data. If not provided, no parent will be returned.
   * @template K - Optional key under which parent data will be found.
   * @param {string} url - API endpoint
   * @param {RequestOptions} options - Request options
   * @returns {Promise<T extends string ? string : ODSresponse<T>>} - Response data, either as string or ODSresponse<T>
   * */
  async function getData<T = string, U = undefined, K extends string = "">(
    url: string,
    options: RequestOptions<K>,
  ): Promise<T extends string ? string : ODSresponse<T, U, K>> {
    // check if API client is initialized
    if (!BASE_URL) {
      throw new Error("BASE_URL not set");
    }
    if (!CLIENT_APIKEY) {
      throw new Error("CLIENT_APIKEY not set");
    }
    if (!SOURCE_APIKEY) {
      throw new Error("SOURCE_APIKEY not set");
    }

    // create request
    const { method, body, apiKey, metadata } = options;
    console.debug(`[API] Request: ${method} ${url}`, body, "key:", apiKey);
    const res = await fetch(BASE_URL + url, {
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

    // error handling
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
    return res.headers.get("content-type")?.includes("application/json") ? res.json() : res.text();
  }

  ////////* API calls *////////

  /**
   * Search projects by project key
   * @param {string} projectKey - Key of the project to search for
   * */
  const searchProjects = async (projectKey: string): Promise<ODSresponse<Project>> => {
    const res = await getData<Project>("/api/search/project", {
      method: "POST",
      apiKey: CLIENT_APIKEY,
      body: {
        filter: `projectKey.eq.${projectKey}`,
      },
    });
    return res;
  };

  /**
   *  Search annotations by project key
   *  @param {string} projectKey - Key of the project to search annotations for
   */
  const searchAnnotations = async (
    projectKey: string,
    showDeleted = false,
  ): Promise<ODSresponse<Annotation>> => {
    // example of how to search for annotations by project key, with Project as parent
    const res = await getData<Annotation, Project, "project">("/api/search/annotation", {
      method: "POST",
      apiKey: CLIENT_APIKEY,
      parent: "project",
      body: {
        filter: `projectKey.eq.${projectKey}` + (showDeleted ? "" : "/deleted.eq.false"),
      },
    });
    return res;
  };

  /**
   * Update or create an annotation
   * @param {Annotation} annotation - Annotation to update or create
   * */
  const upsertAnnotation = async (annotation: Annotation) => {
    await getData(`/api/items/annotation/null/${annotation.itemKey}`, {
      method: "PUT",
      apiKey: SOURCE_APIKEY,
      body: annotation,
    });
  };

  /**
   * Update or create a project
   * @param {Project} project - Project to update or create
   * */
  const upsertProject = async (project: Project) => {
    await getData(`/api/items/project/null/${project.itemKey}`, {
      method: "PUT",
      apiKey: SOURCE_APIKEY,
      body: project,
    });
  };

  const deleteAnnotation = async (annotation: Annotation) => {
    // set deleted flag to true
    annotation.deleted = true;
    await getData(`/api/items/annotation/null/${annotation.itemKey}`, {
      method: "PUT",
      apiKey: SOURCE_APIKEY,
      body: convertODSchild<IAnnotation>(annotation), // convert to IAnnotation to remove unwanted fields (e.g. itemKey, partition)
    });
  };

  const restoreAnnotation = async (annotation: Annotation) => {
    annotation.deleted = false;
    await getData(`/api/items/annotation/null/${annotation.itemKey}`, {
      method: "PUT",
      apiKey: SOURCE_APIKEY,
      body: convertODSchild<IAnnotation>(annotation),
    });
  };

  return {
    initializeClient,
    searchAnnotations,
    upsertAnnotation,
    deleteAnnotation,
    restoreAnnotation,

    searchProjects,
    upsertProject,

    CLIENT_APIKEY,
    SOURCE_APIKEY,
  };
};
