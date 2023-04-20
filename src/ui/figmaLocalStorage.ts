export class FigmaLocalStorage {
  private baseURLValue: string | undefined;

  getBaseURLFromFigmaStorage(): string | undefined {
    // const baseurl = "before event";
    // const payload = event;

    // if (payload.type === "baseURL") {
    //   // Handle the event
    //   console.log("in if", payload.url);
    //   baseurl = payload.url;
    // }
    // console.log("Outside event", baseurl);
    console.log("in getter", this.baseURLValue);
    return this.baseURLValue;
  }

  async getClientKeyFromFigmaStorage(): Promise<string> {
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

  async getSourceKeyFromFigmaStorage(): Promise<string> {
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

  async sendKeysToLocalStorage(
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
  // -----------------------------------------------------------------------------------------------------
  //Figma
  // -----------------------------------------------------------------------------------------------------
  async areKeysSet(): Promise<boolean> {
    //Check if keys are set
    let areKeysSet = false;
    let isBaseUrlNull = true;
    let isClientKeyNull = true;
    let isSourceKeyNull = true;

    await figma.clientStorage.getAsync("baseURL").then((baseURL) => {
      if (baseURL != null) {
        isBaseUrlNull = false;
      }
    });

    await figma.clientStorage.getAsync("clientKey").then((clientKey) => {
      if (clientKey != null) {
        isClientKeyNull = false;
      }
    });

    await figma.clientStorage.getAsync("sourceKey").then((sourceKey) => {
      if (sourceKey != null) {
        isSourceKeyNull = false;
      }
    });

    if (!isBaseUrlNull && !isClientKeyNull && !isSourceKeyNull) {
      areKeysSet = true;
    }

    return areKeysSet;
  }

  async retrieveBaseURLFromStorage() {
    //Getting baseURL from storage
    try {
      if (figma.clientStorage.getAsync("baseURL") != null) {
        const baseURL = await figma.clientStorage.getAsync("baseURL");
        figma.ui.postMessage({ payload: { url: baseURL, type: "baseURL" } });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async retrieveClientKeyFromStorage() {
    //Getting clientKey from storage
    try {
      if (figma.clientStorage.getAsync("clientKey") != null) {
        const clientKey = await figma.clientStorage.getAsync("clientKey");
        figma.ui.postMessage({ payload: { url: clientKey, type: "clientKey" } });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async retrieveSourceKeyFromStorage() {
    //Getting sourceKey from storage
    try {
      if (figma.clientStorage.getAsync("sourceKey") != null) {
        const sourceKey = await figma.clientStorage.getAsync("sourceKey");
        figma.ui.postMessage({ payload: { url: sourceKey, type: "sourceKey" } });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async deleteKeys() {
    figma.clientStorage.deleteAsync("baseURL");
    figma.clientStorage.deleteAsync("clientKey");
    figma.clientStorage.deleteAsync("sourceKey");
    console.log("Keys deleted");
  }

  async setBaseUrl(baseURL: string) {
    try {
      await figma.clientStorage.setAsync("baseURL", baseURL);
    } catch (err) {
      console.log(err);
    }
  }

  async setClientKey(clientKey: string) {
    try {
      await figma.clientStorage.setAsync("clientKey", clientKey);
    } catch (err) {
      console.log(err);
    }
  }

  async setSourceKey(sourceKey: string) {
    try {
      await figma.clientStorage.setAsync("sourceKey", sourceKey);
    } catch (err) {
      console.log(err);
    }
  }

  async retrieveDataFromStorage() {
    await this.areKeysSet().then((value) => {
      if (value) {
        this.retrieveBaseURLFromStorage();
        this.retrieveClientKeyFromStorage();
        this.retrieveSourceKeyFromStorage();
      }
      // const eventData = {
      //   baseURL: this.retrieveBaseURLFromStorage() as Promise<void>,
      //   // clientKey: this.retrieveClientKeyFromStorage() as Promise<void>,
      //   // sourcekey: this.retrieveSourceKeyFromStorage() as Promise<void>,
      // };
      // const keyValuesRetrievedEvent = new CustomEvent("keyValuesRetrieved", {
      //   detail: eventData,
      // });

      // window.dispatchEvent(keyValuesRetrievedEvent);
    });
  }

  initializeEvents() {
    window.addEventListener("load", (event: Event) => {
      // this.retrieveDataFromStorage();
      parent.postMessage(
        {
          pluginMessage: { type: "ListingInUI", payload: "payload" },
        },
        "*",
      );
      // TODO: remove this
      // console.log("event sent");
    });

    window.addEventListener("message", (event) => {
      if (event.data.pluginMessage.type === "keyValuesRetrieved") {
        this.baseURLValue = event.data.pluginMessage.eventData.baseURL;
        console.log("after its set " + this.baseURLValue);
        dispatchEvent(new CustomEvent("loadSettings"));
      }
    });
  }
}
