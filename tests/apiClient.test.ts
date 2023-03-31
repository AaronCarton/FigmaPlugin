import ApiClient from "../src/services/api/client";
import { config } from "dotenv";

config();
const apiClient = ApiClient.initialize({
  baseURL: "http://localhost:1139",
  clientKey: process.env.CLIENT_KEY as string,
  sourceKey: process.env.SOURCE_KEY as string,
});

describe("Tests validation keys", () => {
  beforeAll(async () => {
    config();
  });
  test("Is client key set?", () => {
    expect(process.env.CLIENT_KEY).toBeDefined();
  });
  test("Is source key set?", () => {
    expect(process.env.SOURCE_KEY).toBeDefined();
  });
});

describe("Tests for API client", () => {
  beforeAll(async () => {
    // Setup test for getAnnotations
    jest.setTimeout(60000);
    const annotation = {
      projectKey: "195",
      nodeId: "f249d3d2",
      dataSource: "someSource",
      entity: "someEntity",
      attribute: "title",
      dataType: "string",
      value: "Some neat title",
    };
    apiClient.createAnnotation("195", annotation);

    //Setup test for getProject
    const project = {
      lastUpdated: new Date().toISOString(),
      customerId: "1234",
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    apiClient.createProject("266", project).catch(() => {});
  });

  test("Get annotations by projectKey", async () => {
    const response = await apiClient.getAnnotations("195");
    jest.setTimeout(10000);
    expect(response[0]).not.toBeNull();
  });

  test("Get Project by projectkey", async () => {
    const response = await apiClient.getProject("266");
    jest.setTimeout(10000);
    expect(response[0]).not.toBeNull();
  });
});

// tests: archive = false on project/annotations then try to get it back, same with archive = true
