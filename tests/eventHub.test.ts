import EventHub from "../src/services/events/EventHub";

describe("Tests for eventHub: prefixEventType()", () => {
  test("Is prefix added to type?", () => {
    const type = "testType";
    expect(EventHub.getInstance().prefixEventName(type)).toEqual("Propertize_message_" + type);
  });

  test("Is an error thrown when type is empty?", () => {
    expect(() => {
      EventHub.getInstance().prefixEventName("");
    }).toThrowError("The event name is undefined");
  });
});

describe("Tests for eventHub: getInstance()", () => {
  test("Is an instance returned?", () => {
    expect(EventHub.getInstance()).toBeDefined();
  });
});

describe("Tests for eventHub: sendCustomEvent()", () => {
  let isCalled: boolean;
  beforeAll(() => {
    const prefixedEventName = EventHub.getInstance().prefixEventName("testType");
    window.addEventListener("message", (event) => {
      if (event.data.pluginMessage.type === prefixedEventName) {
        isCalled = true;
      }
    });
  });

  afterAll(() => {
    isCalled = false;
  });

  test("Is event sent?", () => {
    const type = "testType";
    const prefixEventType = EventHub.getInstance().prefixEventName("testType");
    const data = {
      pluginMessage: {
        type: prefixEventType,
        message: "testInCustomEvent",
      },
    };
    EventHub.getInstance().sendCustomEvent(type, data);
    waitUntil(() => isCalled).then(() => {
      expect(isCalled).toBe(true);
    });
  });
});

describe("Tests for eventHub: makeEvent()", () => {
  let eventType: string;
  let isCalled: boolean;

  beforeEach(() => {
    eventType = "testEvent";
  });

  afterEach(() => {
    // Clean up event listener after each test
    isCalled = false;
    window.removeEventListener("message", expect.any(Function));
  });

  test("Is event registred?", () => {
    EventHub.getInstance().makeEvent(eventType, () => {
      isCalled = true;
    });
    const prefixEventType = EventHub.getInstance().prefixEventName(eventType);

    // Simulate a matching event
    const data = {
      pluginMessage: {
        type: prefixEventType,
        message: "messageTest",
      },
    };

    window.postMessage(data, "*");
    waitUntil(() => isCalled).then(() => {
      expect(isCalled).toBe(true);
    });
  });

  test("Is an error thrown when eventType is empty?", () => {
    expect(() => {
      EventHub.getInstance().makeEvent("", () => jest.fn());
    }).toThrowError("The event type cannot be empty");
  });

  test("Is an error thrown when callback is not a function?", () => {
    const invalidCb: any = "not a function";
    expect(() => {
      EventHub.getInstance().makeEvent(eventType, invalidCb);
    }).toThrowError("The callback must be a function");
  });
});

describe("Tests for eventHub: makeEvent() and sendCustomEvent() together", () => {
  let eventType: string;
  let isCalled: boolean;

  afterEach(() => {
    // Clean up event listener after each test
    isCalled = false;
    window.removeEventListener("message", expect.any(Function));
  });

  test("Is event registred and sent?", () => {
    const eventHub = EventHub.getInstance();
    eventType = "testEvent";
    const prefixEventType = eventHub.prefixEventName(eventType);

    eventHub.makeEvent(eventType, () => {
      isCalled = true;
    });

    const data = {
      pluginMessage: {
        type: prefixEventType,
        message: "testInCustomEvent",
      },
    };

    eventHub.sendCustomEvent(eventType, data);
    waitUntil(() => isCalled).then(() => {
      expect(isCalled).toBe(true);
    });
  });
});

// describe("Tests for eventHub: removeEvent()", () => {
//   beforeAll(() => {
//     EventHub.getInstance().getHandlers().push({
//       type: "testEvent",

//     });
//   });
//   test("Is event removed?", () => {

//   });

// });

describe("Tests for eventHub: checkDuplicateEvent()", () => {
  let eventType: string;

  test("Is duplicate event detected?", () => {
    eventType = "testEvent";
    const eventHub = EventHub.getInstance();
    const prefixedEventName = eventHub.prefixEventName(eventType);
    function cb() {
      console.log("cb1");
    }

    eventHub.getHandlers().push({
      type: prefixedEventName,
      originalCallback: cb,
      callback,
    });

    expect(eventHub.checkDuplicateEvent(eventType, cb)).toBe(true);
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
