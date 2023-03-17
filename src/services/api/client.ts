import axios, { AxiosInstance } from "axios"
import Annotation from "../../interfaces/interface.annotation"
import APIError from "../../interfaces/ODS/interface.APIerror"
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

  async function getData<T>(url: string, options: RequestOptions) {
    // check if API client is initialized
    if (!APIclient) {
      throw new Error("API client not initialized")
    }

    // create request
    const { method, body, apiKey, metadata } = options
    const response = await APIclient({
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
    if (response.status !== 200 && response.status !== 201) {
      switch (response.status) {
        case 404:
          throw new APIError(404, "API URL not found, please check your URL")
        case 401:
          throw new APIError(401, "Unauthorized, please check your API key")
        case 500:
          throw new APIError(500, "Internal Server Error")
        default:
          throw new APIError(response.status, "Something went wrong, please try again later")
      }
    }

    return response.data as ODSresponse<T> // TODO: provide generic parent type
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

  return {
    connect,
    searchAnnotations,
  }
}
