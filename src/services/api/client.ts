import axios, { AxiosInstance } from "axios"
import Annotation from "../../interfaces/interface.annotation"
import APIError from "../../interfaces/ODS/interface.APIerror"
import ODSobject from "../../interfaces/ODS/interface.ODSobject"
import ODSresponse from "../../interfaces/ODS/interface.ODSresponse"

let APIclient: AxiosInstance
let CLIENT_APIKEY: string
let SOURCE_APIKEY: string

interface RequestOptions {
  method: "GET" | "PUT" | "POST" | "DELETE"
  apiKey: string
  body?: unknown
  metadata?: boolean
}

export default () => {
  /**
   * Connect to ODS API
   * @param {string} baseURL - Base URL of the ODS API
   * @param {string} clientKey - Client API key
   * @param {string} sourceKey - Source API key
   */
  const connect = async (baseURL: string, clientKey: string, sourceKey: string) => {
    APIclient = axios.create({
      baseURL: baseURL,
      timeout: 2000,
      headers: {
        "content-type": "application/json",
      },
    })
    CLIENT_APIKEY = clientKey
    SOURCE_APIKEY = sourceKey
    return APIclient
  }

  /**
   * Generic function to make API calls
   * @template T - Optional type of returned data. If not provided, a string will be returned.
   * @param {string} url - API endpoint
   * @param {RequestOptions} options - Request options
   * @returns {Promise<T extends string ? string : ODSresponse<T>>} - Response data, either as string or ODSresponse<T>
   * */
  async function getData<T = string>(
    url: string,
    options: RequestOptions,
  ): Promise<T extends string ? string : ODSresponse<T>> {
    // check if API client is initialized
    if (!APIclient) {
      throw new Error("API client not initialized")
    }

    // create request
    const { method, body, apiKey, metadata } = options
    const res = await APIclient({
      url: url,
      method: method,
      data: body,
      headers: {
        "x-api-key": apiKey,
        "x-include-metadata": metadata || false,
        // TODO: add header to include parent-child
      },
    })

    // error handling
    if (![200, 201, 204].includes(res.status)) {
      switch (res.status) {
        case 404:
          throw new APIError(res, "API URL not found, please check your URL")
        case 401:
          throw new APIError(res, "Unauthorized, please check your API key")
        case 500:
          throw new APIError(res, "Internal Server Error")
        default:
          throw new APIError(res, "Something went wrong, please try again later")
      }
    }

    return res.data // TODO: provide generic parent type
  }

  ////////* API calls *////////

  /**
   *  Search annotations by project key
   *  @param {string} projectKey - Key of the project to search annotations for
   */
  const searchAnnotations = async (projectKey: string): Promise<ODSresponse<Annotation>> => {
    const res = await getData<Annotation>("api/search/annotation", {
      method: "POST",
      apiKey: CLIENT_APIKEY,
      body: {
        filter: `projectKey.eq.${projectKey}`,
      },
    })
    return res
  }

  /**
   * Update or create an annotation
   * @param {Annotation} annotation - Annotation to update or create
   * */
  const upsertAnnotation = async (annotation: Annotation) => {
    await getData("api/search/annotation", {
      method: "PUT",
      apiKey: SOURCE_APIKEY,
      body: {
        annotation,
      },
    })
  }
  return {
    connect,
    searchAnnotations,
    upsertAnnotation,
  }
}
