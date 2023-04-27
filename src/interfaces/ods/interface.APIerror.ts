export default class APIError extends Error {
  response: Response;

  constructor(response: Response, message: string) {
    super(message);
    this.name = "APIError";
    this.response = response;
  }
}
