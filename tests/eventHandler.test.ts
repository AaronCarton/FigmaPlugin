import { EventHandler } from "../src/services/events/eventHandler";

describe("Tests for event handler", () => {
  test("Can create event handler", () => {
    const eventHandler = new EventHandler();
    expect(eventHandler).not.toBeNull();
  });
  test("Can get event name", () => {
    const eventHandler = new EventHandler();
    const message = "this is a testmessage";
    const eventName = eventHandler.getEventName(message);
    expect(eventName).toEqual("message-this is a testmessage");
  });
});
describe("makeEvent", () => {
  beforeEach(() => {
    jest.spyOn(document, "addEventListener");
  });

  test("should add an event listener to the document", () => {
    const eventType = "click";
    const callback = jest.fn();
    const eventHandler = new EventHandler();
    eventHandler.makeEvent(eventType, callback);

    expect(document.addEventListener).toHaveBeenCalledTimes(1);
    expect(document.addEventListener).toHaveBeenCalledWith(eventType, callback);
  });

  // test("should handle errors when adding an event listener", () => {
  //   const eventType = "invalidEvent";
  //   const callback = jest.fn();
  //   console.error = jest.fn();
  //   const eventHandler = new EventHandler();
  //   eventHandler.makeEvent(eventType, callback);

  //   expect(document.addEventListener).toHaveBeenCalledTimes(1);
  //   expect(document.addEventListener).toHaveBeenCalledWith(eventType, callback);

  //   expect(console.error).toHaveBeenCalledTimes(1);
  //   expect(console.error).toHaveBeenCalledWith(expect.any(Error));
  // });
});
