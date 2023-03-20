import ApiClient from "../api/client";

export default () => {
  const api = ApiClient();

  async function makeConnection(
    baseURL: string,
    clientKey: string,
    sourceKey: string,
  ): Promise<void> {
    const connection = await api.connect(baseURL, clientKey, sourceKey);
    console.log(connection);
  }

  return {
    makeConnection,
  };
};
