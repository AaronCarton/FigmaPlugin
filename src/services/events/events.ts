import ApiClient from "../api/client";

export default () => {
  const api = ApiClient();

  async function initializeClient(baseURL: string, clientKey: string, sourceKey: string) {
    checkIfProjectExist(baseURL, "test");
    await api.initializeClient(baseURL, clientKey, sourceKey);
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
      throw new Error("Project key is not valid");
    }
  }

  // Function to get project data from ODS
  async function getProjectData(projectKey: string) {
    const data = await api.searchProjects(projectKey);
    return data;
  }

  // Function to get annotation data from ODS
  async function getAnnotationData(projectKey: string, showDeleted: boolean) {
    const data = await api.searchAnnotations(projectKey, showDeleted);
    return data;
  }

  return {
    initializeClient,
  };
};

// Function to check if given database URL is valid, for now just checks with a regex but needs to be checked with ODS to see if link exists.
async function validateUrl(url: string) {
  const urlPattern = /^(https:?|ftp):\/\/(-\.)?([^\s/?.#-]+\.?)+(\/[^\s]*)?$/i;
  const isValid = urlPattern.test(url);

  try {
    const response = await (await fetch(url)).status;
    if (response === 404) {
      throw new Error("URL is not found");
    }
    if (!isValid) {
      throw new Error("URL is not valid");
    }
  } catch (error) {
    return error;
  }
}
