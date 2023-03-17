export default class APIError extends Error {
  httpStatus: number

  constructor(httpStatus: number, message: string) {
    super(message)
    this.name = "APIError"
    this.httpStatus = httpStatus
  }
}
