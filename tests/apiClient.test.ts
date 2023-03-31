import ApiClient from "../src/services/api/client";
import Project from "../src/interfaces/interface.project";
import Annotation from "../src/interfaces/interface.annotation";
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
    await apiClient.createAnnotation("195", annotation);

    //Setup test for getProject
    const project = {
      lastUpdated: new Date().toISOString(),
      customerId: "1234",
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await apiClient.createProject("268", project).catch(() => {});

    //setup test for getProject when archived
    const projectArchived = {
      lastUpdated: new Date().toISOString(),
      customerId: "456",
    };
    (await apiClient.createProject("666", projectArchived)).archive();

    //setup test for getAnnotations when archived
    const annotationArchived = {
      projectKey: "195",
      nodeId: "f249d3d2",
      dataSource: "someSource",
      entity: "someEntity",
      attribute: "titleArchived",
      dataType: "string",
      value: "Some neat title",
    };
    await apiClient.createAnnotation("195", annotationArchived);
  });

  test("Get annotations by projectKey", async () => {
    jest.setTimeout(10000);
    const response = await apiClient.getAnnotations("195").then(async (res) => {
      expect(res[0]).not.toBeNull();
    });
  });

  test("Get Project by projectkey", async () => {
    jest.setTimeout(10000);
    const response = await apiClient.getProject("268").then(async (res) => {
      expect(res[0]).not.toBeNull();
    });
  });

  test("Get archived project (by projectKey) when archived = false", async () => {
    jest.setTimeout(10000);
    const project = await apiClient.getProject("666", false).then(async (res) => {
      res[0].archive();
      const archivedProject = await apiClient.getProject("666", false);
      expect(archivedProject[0]).not.toBeNull();
    });
  });
  // test("Get annotation by projectKey when archived", async () => {
  //   const response = await apiClient.getAnnotations("195", false);
  //   jest.setTimeout(10000);
  //   response[0].archive();
  //   expect(response[0]).toBeNull();
  // });
});

// tests: archive = false on project/annotations then try to get it back, same with archive = true
