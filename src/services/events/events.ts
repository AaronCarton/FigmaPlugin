import { RequestOptions } from "../api/client";
import ApiClient from "../api/client";
import Project from "../../interfaces/interface.project";

export default () => {
  const api = ApiClient();

  async function makeConnection(baseURL: string, clientKey: string, sourceKey: string) {
    checkIfProjectExist(baseURL, "test");
    const connection = await api.connect(baseURL, clientKey, sourceKey);
    console.log(connection);
  }

  // Function to check is the project already exists or not.
  // If project does not exist yet, a new project will be made with a projectKey, if it already exists the data will be returned.
  async function checkIfProjectExist(baseURL: string, projectKey: string) {
    // URL check to see if url is valid or not.
    validateUrl(baseURL);

    // Check if project exists
    if (projectKey !== null || projectKey !== undefined) {
      getProjectData(projectKey);
      getAnnotationData(projectKey, false);
    } else {
      console.error("Project key is not valid");
    }
  }

  // Function to get project data from ODS
  async function getProjectData(projectKey: string) {
    const data = await api.searchProjects(projectKey);
    console.log(data);
    return data;
  }

  // Function to get annotation data from ODS
  async function getAnnotationData(projectKey: string, showDeleted: boolean){
    const data = await api.searchAnnotations(projectKey, showDeleted);
    console.log(data);
    return data;
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
