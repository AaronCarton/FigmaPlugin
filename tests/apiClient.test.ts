import { IAnnotation } from "../src/interfaces/interface.annotation";
import { IProject } from "../src/interfaces/interface.project";
import ApiClient from "../src/services/api/client";
import { config } from "dotenv";

config(); // Load environment variables from .env file
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
  test("Is base url set?", () => {
    expect(process.env.BASE_URL).toBeDefined();
  });
});

describe("Tests for API client: projects", () => {
  test("Can create project", async () => {
    const project: IProject = {
      lastUpdated: new Date().toISOString(),
      customerId: "1234",
    };
    await apiClient.createProject("100", project).then(async (res) => {
      expect(res).not.toBeNull();
      expect(res.itemKey).toEqual("100"); // Check if the project key is correct
    });
  });

  test("Get Project by projectkey", async () => {
    const project: IProject = {
      lastUpdated: new Date().toISOString(),
      customerId: "1234",
    };
    await apiClient.createProject("100", project);

    await apiClient.getProject("100").then(async (res) => {
      expect(res).not.toEqual(0);
      expect(res?.itemKey).toEqual("100"); // Check if the project key is correct
    });
  });

  test("Can archive project", async () => {
    const project: IProject = {
      lastUpdated: new Date().toISOString(),
      customerId: "1234",
    };
    await apiClient.createProject("101", project);
    await apiClient.getProject("101").then(async (res) => {
      res?.archive();
      expect(res?.archived).not.toBeNull(); // Check if the archive field of the project isn't null
    });
  });

  test("Cannot get archived project when IncludeArchived = false", async () => {
    const project: IProject = {
      lastUpdated: new Date().toISOString(),
      customerId: "1234",
    };
    await apiClient.createProject("102", project);

    await apiClient.getProject("102", false).then(async (res) => {
      waitUntil(() => res === null) // Wait for archived annotation to be indexed first
        .then(() => {
          expect(res).toBeNull();
        })
        .catch((err) => {
          throw err;
        });
    });
  });

  test("Can get archived project when IncludeArchived = true", async () => {
    const project: IProject = {
      lastUpdated: new Date().toISOString(),
      customerId: "1234",
    };
    await apiClient.createProject("103", project);

    await apiClient.getProject("103", true).then(async (res) => {
      expect(res).not.toBeNull();
      expect(res?.itemKey).toEqual("103"); // Check if the project key is correct
    });
  });
});

describe("Tests for API client: annotations", () => {
  test("Can create annotation", async () => {
    const annotation: IAnnotation = {
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
    const project: IProject = {
      lastUpdated: new Date().toISOString(),
      customerId: "1234",
    };
    await apiClient.createProject("104", project);

    const annotation: IAnnotation = {
      projectKey: "104",
      nodeId: "f249d3d2",
      dataSource: "someSource",
      entity: "someEntity",
      attribute: "titleArchived",
      dataType: "string",
      value: "Some neat title",
    };
    await apiClient.createAnnotation("104", annotation);

    await apiClient.getAnnotations("104").then(async (res) => {
      waitUntil(() => res !== null).then(() => {
        expect(res).not.toEqual(0);
        expect(res[0].itemKey).toEqual("104"); // Check if the annotation key is correct
      });
    });
  });

  test("Can archive annotation", async () => {
    const project: IProject = {
      lastUpdated: new Date().toISOString(),
      customerId: "1234",
    };
    await apiClient.createProject("105", project);

    const annotation: IAnnotation = {
      projectKey: "105",
      nodeId: "f249d3d2",
      dataSource: "someSource",
      entity: "someEntity",
      attribute: "titleArchived",
      dataType: "string",
      value: "Some neat title",
    };
    await apiClient.createAnnotation("105", annotation);

    await apiClient.getAnnotations("105").then(async (res) => {
      waitUntil(() => res[0].archived !== null).then(() => {
        res[0].archive();
        expect(res[0].archived).not.toBeNull();
      });
    });
  });

  test("Cannot get archived annotation when IncludeArchived = false", async () => {
    const project: IProject = {
      lastUpdated: new Date().toISOString(),
      customerId: "1234",
    };
    await apiClient.createProject("106", project);

    const annotation: IAnnotation = {
      projectKey: "106",
      nodeId: "f249d3d2",
      dataSource: "someSource",
      entity: "someEntity",
      attribute: "titleArchived",
      dataType: "string",
      value: "Some neat title",
    };
    await apiClient.createAnnotation("106", annotation);

    await apiClient.getAnnotations("106", false).then(async (res) => {
      waitUntil(() => res === null) // Wait for archived annotation to be indexed first
        .then(() => {
          expect(res.length).toEqual(0);
        })
        .catch((err) => {
          throw err;
        });
    });
  });

  test("Can get archived annotation when IncludeArchived = true", async () => {
    const project: IProject = {
      lastUpdated: new Date().toISOString(),
      customerId: "1234",
    };
    await apiClient.createProject("107", project);

    const annotation: IAnnotation = {
      projectKey: "107",
      nodeId: "f249d3d2",
      dataSource: "someSource",
      entity: "someEntity",
      attribute: "titleArchived",
      dataType: "string",
      value: "Some neat title",
    };
    await apiClient.createAnnotation("107", annotation);

    await apiClient.getAnnotations("107", true).then(async (res) => {
      expect(res).not.toBeNull();
      expect(res[0].itemKey).toEqual("107");
    });
  });
});

function waitUntil(condition: () => boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    let count = 0; // Number of times the condition has been checked
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function check() {
      if (condition()) {
        resolve();
      } else {
        count++;
        if (count > 3) {
          // checks 3 times, 1.5 seconds in total
          reject(new Error("Timeout"));
        } else {
          setTimeout(check, 500);
        }
      }
    }
  });
}
