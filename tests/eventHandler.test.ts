// import { EventHandler } from "../src/services/events/eventHandler";

// describe("Tests for event handler", () => {
//   test("Can create event handler", () => {
//     const eventHandler = new EventHandler();
//     expect(eventHandler).not.toBeNull();
//   });
//   test("Can get event name", () => {
//     const eventHandler = new EventHandler();
//     const message = "this is a testmessage";
//     const eventName = eventHandler.getEventName(message);
//     expect(eventName).toEqual("message-this is a testmessage");
//   });
// });
// describe("makeEvent function", () => {
//   beforeEach(() => {
//     jest.spyOn(document, "addEventListener"); // Mock the addEventListener function
//   });

//   test("should add an event listener to the document", () => {
//     const eventType = "click";
//     const callback = jest.fn(); // Mock the callback function
//     const eventHandler = new EventHandler();
//     eventHandler.makeEvent(eventType, callback);

//     expect(document.addEventListener).toHaveBeenCalledTimes(1);
//     expect(document.addEventListener).toHaveBeenCalledWith(eventType, callback);
//   });
// });
// describe("sendMessage function", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   test("should dispatch a custom event with the correct message type and detail", () => {
//     const mockDispatchEvent = jest.spyOn(document, "dispatchEvent"); // Mock the dispatchEvent function

//     const messageType = "success";
//     const message = "The operation was successful.";
//     const eventHandler = new EventHandler();
//     eventHandler.sendMessage(messageType, message);

//     expect(mockDispatchEvent).toHaveBeenCalledTimes(1);
//     expect(mockDispatchEvent).toHaveBeenCalledWith(
//       new CustomEvent("message-success", {
//         bubbles: true,
//         detail: { message: message },
//       }),
//     );
//   });
// });
