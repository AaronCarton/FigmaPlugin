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

describe("Tests for API client: projects", () => {
  jest.setTimeout(30000);
  test("Can create project", async () => {
    jest.setTimeout(30000);
    const project = {
      lastUpdated: new Date().toISOString(),
      customerId: "1234",
    };
    await apiClient.createProject("74", project).then(async (res) => {
      expect(res).not.toBeNull();
      expect(res.itemKey).toEqual("74"); // Check if the project key is correct
    });
  });

  test("Get Project by projectkey", async () => {
    jest.setTimeout(30000);
    await apiClient.getProject("74").then(async (res) => {
      expect(res).not.toEqual(0);
      expect(res[0].itemKey).toEqual("74"); // Check if the project key is correct
    });
  });

  test("Can archived project", async () => {
    jest.setTimeout(30000);
    await apiClient.getProject("74").then(async (res) => {
      res[0].archive();
      expect(res[0].archived).not.toBeNull(); // Check if the archive field of the project isn't null
    });
  });

  test("Get archived project when IncludeArchived = false", async () => {
    await new Promise((r) => setTimeout(r, 5000)); // Wait for the project to be archived
    await apiClient.getProject("74", false).then(async (res) => {
      expect(res.length).toEqual(0);
    });
  });
  test("Get archived project when IncludeArchived = true", async () => {
    jest.setTimeout(10000);
    await apiClient.getProject("74", true).then(async (res) => {
      expect(res.length).not.toEqual(0);
      expect(res[0].itemKey).toEqual("74"); // Check if the project key is correct
    });
  });
});

describe("Tests for API client: annotations", () => {
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
      expect(res.itemKey).toEqual("85"); // Check if the annotation key is correct
    });
  });

  test("Get annotations by projectKey", async () => {
    jest.setTimeout(30000);
    await apiClient.getAnnotations("85").then(async (res) => {
      expect(res).not.toEqual(0);
      expect(res[0].itemKey).toEqual("85"); // Check if the annotation key is correct
    });
  });

  test("Can archive project", async () => {
    jest.setTimeout(30000);
    await apiClient.getProject("74").then(async (res) => {
      res?.archive();
      expect(res?.archived).not.toBeNull();
    });
  });

  test("Cannot get archived when IncludeArchived = false", async () => {
    await new Promise((r) => setTimeout(r, 5000)); // Wait for archived project to be indexed first
    await apiClient.getProject("74", false).then(async (res) => {
      expect(res).toBeNull();
    });
  });
  test("Can get archived project when IncludeArchived = true", async () => {
    jest.setTimeout(10000);
    await apiClient.getProject("74", true).then(async (res) => {
      expect(res).not.toBeNull();
      expect(res?.itemKey).toEqual("74");
    });
  });
});

// TODO:check itemkey = project? in annotation, some tests are not working
