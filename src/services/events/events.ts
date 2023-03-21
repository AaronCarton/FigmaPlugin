import { ApiClient, RequestOptions } from "../api/client";

export default () => {
  const api = ApiClient();

  async function makeConnection(baseURL: string, clientKey: string, sourceKey: string) {
    const connection = await api.connect(baseURL, clientKey, sourceKey);
    console.log(connection);
  }

  async function getData(baseURL: string, options: RequestOptions) {
    const data = await api.getData(baseURL, options);
    console.log(data);
  }

  return {
    makeConnection,
    getData,
  };
};
