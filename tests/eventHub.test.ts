import EventHub from "../src/services/events/EventHub";

describe("Tests for eventHub: prefixEventType()", () => {
  test("Is prefix added to type?", () => {
    const type = "testType";
    expect(EventHub.getInstance().prefixEventName(type)).toEqual("Propertize_message_" + type);
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
    const prefixedEventName = EventHub.getInstance().prefixEventName("testType");
    const data = {
      pluginMessage: {
        type: prefixedEventName,
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

  test("Is event registred", () => {
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
