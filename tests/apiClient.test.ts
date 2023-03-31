import ApiClient from "../src/services/api/client";
import { config } from "dotenv";

config();
const apiClient = ApiClient.initialize({
  baseURL: process.env.BASE_URL as string,
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
  jest.setTimeout(30000);
  test("Can create project", async () => {
    jest.setTimeout(30000);
    const project = {
      lastUpdated: new Date().toISOString(),
      customerId: "1234",
    };
    await apiClient.createProject("74", project).then(async (res) => {
      expect(res).not.toBeNull();
    });
  });

  test("Can create annotation", async () => {
    jest.setTimeout(30000);
    const annotation = {
      projectKey: "74",
      nodeId: "f249d3d2",
      dataSource: "someSource",
      entity: "someEntity",
      attribute: "titleArchived",
      dataType: "string",
      value: "Some neat title",
    };
    await apiClient.createAnnotation("85", annotation).then(async (res) => {
      expect(res).not.toBeNull();
    });
  });

  test("Get Project by projectkey", async () => {
    jest.setTimeout(30000);
    await apiClient.getProject("74").then(async (res) => {
      expect(res).not.toEqual(0);
    });
  });

  test("Get annotations by projectKey", async () => {
    jest.setTimeout(30000);
    await apiClient.getAnnotations("85").then(async (res) => {
      expect(res).not.toEqual(0);
    });
  });

  test("Can archived project", async () => {
    jest.setTimeout(30000);
    await apiClient.getProject("74").then(async (res) => {
      res[0].archive();
      expect(res[0].archived).not.toBeNull();
    });
  });

  test("Get archived project when IncludeArchived = false", async () => {
    jest.setTimeout(10000);
    await apiClient.getProject("74", false).then(async (res) => {
      expect(res).toEqual(0);
    });
  });
  test("Get archived project when IncludeArchived = true", async () => {
    jest.setTimeout(10000);
    await apiClient.getProject("74", false).then(async (res) => {
      expect(res).not.toEqual(0);
      expect(res[0].itemKey).toEqual("74");
    });
  });
});

// tests: archive = false on project/annotations then try to get it back, same with archive = true
