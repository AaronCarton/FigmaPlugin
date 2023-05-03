import EventHub from "../src/services/events/EventHub";

describe("Tests for eventHub: prefixEventType()", () => {
  test("Is prefix added to type?", () => {
    const type = "testType";
    expect(EventHub.getInstance().prefixEventType(type)).toEqual("PROPERTIZE_MESSAGE_" + type);
  });

  test("Is an error thrown when type is empty?", () => {
    expect(() => {
      EventHub.getInstance().prefixEventType("");
    }).toThrowError("The event type cannot be empty");
  });
});

describe("Tests for eventHub: checkDuplicateEvent()", () => {
  let eventType: string;
  let anotherEventType: string;
  afterEach(() => {
    // Clear handlers after each test
    EventHub.getInstance().getHandlers().splice(0, EventHub.getInstance().getHandlers().length);
  });

  test("Is duplicate event detected?", () => {
    eventType = "testEvent";
    const eventHub = EventHub.getInstance();
    const prefixedEventName = eventHub.prefixEventType(eventType);
    function cb() {
      console.log("cb1");
    }

    eventHub.getHandlers().push({
      type: prefixedEventName,
      originalCallback: cb,
      callback: cb,
    });

    expect(eventHub.checkDuplicateEvent(eventType, cb)).toBe(true);
  });

  test("Is not detected for different callbacks", () => {
    eventType = "testEvent";
    const eventHub = EventHub.getInstance();
    const prefixedEventName = eventHub.prefixEventType(eventType);

    function cb() {
      console.log("cb1");
    }

    function anotherCb() {
      console.log("anotherCb");
    }

    eventHub.getHandlers().push({
      type: prefixedEventName,
      originalCallback: cb,
      callback: cb,
    });

    expect(eventHub.checkDuplicateEvent(eventType, anotherCb)).toBe(false);
  });

  test("Is not detected for different event types", () => {
    eventType = "testEvent";
    anotherEventType = "testEvent2";
    const eventHub = EventHub.getInstance();
    const prefixedEventName = eventHub.prefixEventType(eventType);
    function cb() {
      console.log("cb1");
    }

    eventHub.getHandlers().push({
      type: prefixedEventName,
      originalCallback: cb,
      callback: cb,
    });

    expect(eventHub.checkDuplicateEvent(anotherEventType, cb)).toBe(false);
  });
});

describe("Tests for eventHub: getInstance()", () => {
  test("Is an instance returned?", () => {
    expect(EventHub.getInstance()).toBeDefined();
  });
});

describe("Tests for eventHub: sendCustomEvent()", () => {
  let isCalled: boolean;
  beforeEach(() => {
    const prefixedEventName = EventHub.getInstance().prefixEventType("testType");
    window.addEventListener("message", (event) => {
      if (event.data.pluginMessage.type === prefixedEventName) {
        isCalled = true;
      }
    });
  });

  afterEach(() => {
    isCalled = false;
  });

  test("Is event sent?", () => {
    const type = "testType";
    const prefixEventType = EventHub.getInstance().prefixEventType("testType");
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
  let counter: number;

  beforeEach(() => {
    eventType = "testEvent";
  });

  afterEach(() => {
    // Clean up after each test
    isCalled = false;
    counter = 0;
    window.removeEventListener("message", expect.any(Function));
  });

  test("Is event registred?", () => {
    EventHub.getInstance().makeEvent(eventType, () => {
      isCalled = true;
    });
    const prefixEventType = EventHub.getInstance().prefixEventType(eventType);

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

  test("callback is not called twice when two exact same makeEvent()'s are called", () => {
    EventHub.getInstance().makeEvent(eventType, () => {
      counter++;
    });

    EventHub.getInstance().makeEvent(eventType, () => {
      counter++;
    });

    const prefixEventType = EventHub.getInstance().prefixEventType(eventType);
    const data = {
      pluginMessage: {
        type: prefixEventType,
        message: "messageTest",
      },
    };
    window.postMessage(data, "*");

    waitUntil(() => counter === 1).then(() => {
      expect(counter).toBe(1);
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
    const prefixEventType = eventHub.prefixEventType(eventType);

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

describe("Tests for eventHub: removeEvent()", () => {
  let eventType: string;
  afterEach(() => {
    EventHub.getInstance().getHandlers().splice(0, EventHub.getInstance().getHandlers().length);
  });

  beforeAll(() => {
    eventType = "testEvent";
    const prefixedEventName = EventHub.getInstance().prefixEventType(eventType);
    function cb() {
      console.log("cb1");
    }

    EventHub.getInstance().getHandlers().push({
      type: prefixedEventName,
      originalCallback: cb,
      callback: cb,
    });
  });
  test("Is event removed?", () => {
    const eventHub = EventHub.getInstance();
    const prefixedEventName = eventHub.prefixEventType(eventType);
    eventHub.removeEvent(eventType);
    expect(eventHub.getHandlers().find((event) => event.type === prefixedEventName)).toBeUndefined();
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
