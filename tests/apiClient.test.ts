import ApiClient from "../src/services/api/client";

const apiClient = ApiClient.initialize({
  baseURL: "http://localhost:1139",
  clientKey: "123",
  sourceKey: "123",
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

  afterAll(async () => {
    // Clean up any test data
  });
  //   test("Client key is set", () => {
  //      expect(process.env.CLIENT_KEY).toBeDefined();
  //   });
  //   test("Source key is set", () => {
  //     expect(process.env.SOURCE_KEY).toBeDefined();
  //   });
  test("Get annotations by projectKey", async () => {
    const response = await apiClient.getAnnotations("195");
    jest.setTimeout(10000);
    expect(response[0]).not.toBeNull();
  });

  test("Get Project by projectkey", async () => {
    const response = await apiClient.getProject("266");
    jest.setTimeout(10000);
    expect(response[0].customerId).toEqual("1234");
  });
});
