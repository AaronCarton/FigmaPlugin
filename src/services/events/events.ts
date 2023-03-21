import { RequestOptions } from "../api/client";
import client from "../api/client";
import Project from "../../interfaces/interface.project";

export default () => {
  const api = client();

  async function makeConnection(baseURL: string, clientKey: string, sourceKey: string) {
    const connection = await api.connect(baseURL, clientKey, sourceKey);
    checkIfProjectExist(baseURL, "test", clientKey);
    console.log(connection);
  }

  async function getData(baseURL: string, options: RequestOptions<unknown>) {
    const data = await api.getData(baseURL, options);
    console.log(data);
  }

  // Function to check is the project already exists or not.
  // If project does not exist yet, a new project will be made with a projectKey, if it already exists the data will be returned.
  async function checkIfProjectExist(baseURL: string, projectKey: string, clientKey: string) {
    // URL check to see if url is valid or not.
    validateUrl(baseURL);

    if (await api.searchProjects(projectKey)) {
      console.log("Project already exists");
      const data = await getData(baseURL, {
        method: "POST",
        apiKey: clientKey,
        body: {
          query: {
            bool: {
              must: {
                match: {
                  itemKey: projectKey,
                },
              },
            },
          },
        },
      });
    } else {
      console.log("Project does not exist, creating new project");
      api.upsertProject({
        itemType: "project",
        partition: "null",
        itemKey: projectKey,
        localized: [],
      } as Project);
    }
  }

  return {
    makeConnection,
  };
};

// Function to check if given database URL is valid, for now just checks with a regex but needs to be checked with ODS to see if link exists.
function validateUrl(url: string): void | string {
  const urlPattern = /^(https:?|ftp):\/\/(-\.)?([^\s/?.#-]+\.?)+(\/[^\s]*)?$/i;
  const isValid = urlPattern.test(url);

  if (isValid) {
    console.log("Valid URL: " + url);
  } else {
    const errorMessage = "Invalid URL: " + url;
    console.error(errorMessage);
    return errorMessage;
  }
}
