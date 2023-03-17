import { AxiosResponse } from "axios"

export default class APIError extends Error {
  response: AxiosResponse

  constructor(response: AxiosResponse, message: string) {
    super(message)
    this.name = "APIError"
    this.response = response
  }
}
