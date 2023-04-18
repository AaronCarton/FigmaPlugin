export class FigmaLocalStorage {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async getBaseURLFromFigmaStorage(): Promise<string> {
    return new Promise((resolve) => {
      window.addEventListener("message", (event) => {
        // Check if the event data is what you expect
        const payload = event.data.pluginMessage.payload;
        if (payload.type === "baseURL") {
          // Handle the event
          resolve(payload.url);
        }
      });
    });
  }

  public async getClientKeyFromFigmaStorage(): Promise<string> {
    return new Promise((resolve) => {
      window.addEventListener("message", (event) => {
        // Check if the event data is what you expect
        const payload = event.data.pluginMessage.payload;
        if (payload.type === "clientKey") {
          // Handle the event
          resolve(payload.url);
        }
      });
    });
  }

  public async getSourceKeyFromFigmaStorage(): Promise<string> {
    return new Promise((resolve) => {
      window.addEventListener("message", (event) => {
        // Check if the event data is what you expect
        const payload = event.data.pluginMessage.payload;
        if (payload.type === "sourceKey") {
          // Handle the event
          resolve(payload.url);
        }
      });
    });
  }

  public async sendKeysToLocalStorage(
    baseURL: string | undefined,
    clientKey: string | undefined,
    sourceKey: string | undefined,
  ): Promise<void> {
    parent.postMessage(
      {
        pluginMessage: {
          type: "setKeys",
          baseURL: baseURL,
          clientKey: clientKey,
          sourceKey: sourceKey,
        },
      },
      "*",
    );
  }
}
