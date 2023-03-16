import axios, { AxiosInstance } from "axios"
import Annotation from "../../interfaces/interface.annotation"
import ODSresponse from "../../interfaces/ODS/interface.ODSresponse"

let APIclient: AxiosInstance

interface RequestOptions {
  method: "GET" | "PUT"
  apiKey: string
  body?: unknown
  metadata?: boolean
}

export default () => {
  const connect = async (baseURL: string) => {
    APIclient = axios.create({
      baseURL: baseURL,
      timeout: 2000,
      headers: {
        "content-type": "application/json",
      },
    })
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
          throw new Error("API URL not found, please check your URL")
        case 401:
          throw new Error("Unauthorized, please check your API key")
        case 500:
          throw new Error("Internal Server Error")
        default:
          throw new Error("Something went wrong, please try again later")
      }
    }

    return response.data as ODSresponse<T> // TODO: provide generic parent type
  }

  ////////* API calls *////////

  const searchAnnotations = async (projectKey: string): Promise<ODSresponse<Annotation>> => {
    const res = await getData<Annotation>(
      `api/search/annotation?filter=projectKey.eq.${projectKey}`,
      {
        method: "GET",
        apiKey: "123",
      },
    )
    return res
  }

  return {
    connect,
    searchAnnotations,
  }
}
