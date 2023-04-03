import ApiClient from "../src/services/api/client";
import { config } from "dotenv";

config();
const apiClient = ApiClient.initialize({
  baseURL: process.env.BASE_URL as string,
  clientKey: process.env.CLIENT_KEY as string,
  sourceKey: process.env.SOURCE_KEY as string,
});

describe("Tests validation keys", () => {
  // Only useful for testing purposes
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

describe("Tests for API client: projects", () => {
  jest.setTimeout(30000);
  test("Can create project", async () => {
    jest.setTimeout(30000);
    const project = {
      lastUpdated: new Date().toISOString(),
      customerId: "1234",
    };
    await apiClient.createProject("100", project).then(async (res) => {
      expect(res).not.toBeNull();
      expect(res.itemKey).toEqual("100"); // Check if the project key is correct
    });
  });

  test("Get Project by projectkey", async () => {
    jest.setTimeout(30000);
    await apiClient.getProject("100").then(async (res) => {
      expect(res).not.toEqual(0);
      expect(res?.itemKey).toEqual("100"); // Check if the project key is correct
    });
  });

  test("Can archive project", async () => {
    jest.setTimeout(30000);
    await apiClient.getProject("100").then(async (res) => {
      res?.archive();
      expect(res?.archived).not.toBeNull(); // Check if the archive field of the project isn't null
    });
  });

  test("Cannot get archived project when IncludeArchived = false", async () => {
    await new Promise((r) => setTimeout(r, 5000)); // Wait for archived project to be indexed first
    await apiClient.getProject("100", false).then(async (res) => {
      expect(res).toBeNull();
    });
  });
  test("Can get archived project when IncludeArchived = true", async () => {
    jest.setTimeout(10000);
    await apiClient.getProject("100", true).then(async (res) => {
      expect(res).not.toBeNull();
      expect(res?.itemKey).toEqual("100"); // Check if the project key is correct
    });
  });
});

describe("Tests for API client: annotations", () => {
  test("Can create annotation", async () => {
    jest.setTimeout(30000);
    const annotation = {
      projectKey: "100",
      nodeId: "f249d3d2",
      dataSource: "someSource",
      entity: "someEntity",
      attribute: "titleArchived",
      dataType: "string",
      value: "Some neat title",
    };
    await apiClient.createAnnotation("100", annotation).then(async (res) => {
      expect(res).not.toBeNull();
      expect(res.itemKey).toEqual("100"); // Check if the annotation key is correct
    });
  });

  test("Get annotations by projectKey", async () => {
    jest.setTimeout(30000);
    await apiClient.getAnnotations("100").then(async (res) => {
      expect(res).not.toEqual(0);
      expect(res[0].itemKey).toEqual("100"); // Check if the annotation key is correct
    });
  });

  test("Can archive annotation", async () => {
    jest.setTimeout(30000);
    await apiClient.getAnnotations("100").then(async (res) => {
      res[0].archive();
      expect(res[0].archived).not.toBeNull();
    });
  });

  test("Cannot get archived annotation when IncludeArchived = false", async () => {
    jest.setTimeout(30000);
    await new Promise((r) => setTimeout(r, 5000)); // Wait for archived annotation to be indexed first
    await apiClient.getAnnotations("100", false).then(async (res) => {
      expect(res.length).toEqual(0);
    });
  });
  test("Can get archived annotation when IncludeArchived = true", async () => {
    jest.setTimeout(10000);
    await apiClient.getAnnotations("100", true).then(async (res) => {
      expect(res).not.toBeNull();
      expect(res[0].itemKey).toEqual("100");
    });
  });
});

// TODO:check itemkey = project? in annotation, some tests are not working
