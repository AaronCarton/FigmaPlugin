import ApiClient from "../api/client";

export default () => {
  const api = ApiClient();

  async function initializeClient(baseURL: string, clientKey: string, sourceKey: string) {
    checkIfProjectExist(baseURL, "75059577");
    await api.initializeClient(baseURL, clientKey, sourceKey);
    getProjectData("75059577");
    getAnnotationData("75059577", true);
  }

  // Function to check is the project already exists or not.
  // If project does not exist yet, a new project will be made with a projectKey, if it already exists the data will be returned.
  async function checkIfProjectExist(baseURL: string, projectKey: string) {
    // URL check to see if url is valid or not.
    validateUrl(baseURL);

    // Check if project exists
    if (projectKey === null || projectKey === undefined) {
      throw new Error("Project key is not valid");
    }
  }

  // Function to get project data from ODS
  async function getProjectData(projectKey: string) {
    const data = await api.searchProjects(projectKey).then((res) => res.results.map((r) => r.item));
    console.log(data); // DELETE THIS - temporary
    return data;
  }

  // Function to get annotation data from ODS
  async function getAnnotationData(projectKey: string, showDeleted: boolean) {
    const data = await api
      .searchAnnotations(projectKey, showDeleted)
      .then((res) => res.results.map((r) => r.item));

    console.log(data); // DELETE THIS - temporary
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

  //* No point in checking if URL exists, because the base Azure URL will always return 404
  // try {
  //   const response = await (await fetch(url)).status;
  //   if (response === 404) {
  //     throw new Error("URL is not found");
  //   }
  //   if (!isValid) {
  //     throw new Error("URL is not valid");
  //   }
  // } catch (error) {
  //   return error;
  // }
}
