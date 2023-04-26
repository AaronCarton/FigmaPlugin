import { IfigmaMessage } from "../../interfaces/interface.figmaMessage";

export default class EventHub {
  private static instance: EventHub;
  handlers: any;

  /**
   * Get the instance of the EventHub
   * @returns {EventHub} The instance of the EventHub
   * @throws {Error} If the instance is not initialized
   */
  public static getInstance(): EventHub {
    if (!EventHub.instance) EventHub.instance = new EventHub();
    return EventHub.instance;
  }

  /**
   * @description It creates an event with an eventName and a callback function
   * @param {string} eventName - The name of the event that will be listened to
   * @param {function} callback - The function that is called when the event is triggered
   * @returns {void}
   */

  // makeEvent(eventName: string, callback: EventListener): void {
  //   if (eventName && eventName.trim() === "") throw new Error("The event name cannot be empty");
  //   if (typeof callback !== "function") throw new TypeError("The callback must be a function");
  //   if (!this.handlers) this.handlers = {};

  //   const prefixedEventName = this.prefixEventName(eventName);

  //   this.handlers[prefixedEventName] = (e: { detail: { message: Event } }) =>
  //     callback(e.detail.message);
  //   // message = messagetype
  //   // document.addEventListener("message", (e: Event) => {
  //   //   if (e.type === eventName) {
  //   //     this.handlers[prefixedEventName];
  //   //   }
  //   // });
  //   document.addEventListener(prefixedEventName, this.handlers[prefixedEventName]);
  // }

  makeEventInFigma(eventType: string, callback: EventListener): void {
    if (eventType && eventType.trim() === "") throw new Error("The event type cannot be empty");
    if (typeof callback !== "function") throw new TypeError("The callback must be a function");
    if (!this.handlers) this.handlers = {};

    const prefixedEventName = this.prefixEventName(eventType);
    figma.ui.onmessage = (event) => {
      if (event.type === eventType) {
        console.log("event.type", event.type);
        this.handlers[prefixedEventName];
      }
    };
  }

  // TESTING makeEvent
  makeEvent(eventType: string, callback: EventListener): void {
    // if (eventType && eventType.trim() === "") throw new Error("The event type cannot be empty");
    // if (typeof callback !== "function") throw new TypeError("The callback must be a function");
    // if (!this.handlers) this.handlers = {};

    // if ((document as any).addEventListener) {
    //   console.log("addEventListener is a defined");
    // } else {
    //   console.log("addEventListener is undefined");

    //   (document as any).addEventListener = function (type: string, handler: EventListener) {
    // }

    if (!document) console.log("document is undefined");
    if (!window) console.log("window is undefined");
    if (!document.addEventListener) console.log("document.addEventListener is undefined");
    if (!window.addEventListener) console.log("window.addEventListener is undefined");
  }

  /**
   * @description It sends a custom event with the eventName and a message
   * @param {string} eventName - The name of the event that will be listened to
   * @param {string} message - The message that will be sent with the event
   * @returns {void}
   */
  sendCustomEvent(eventName: string, message: string): void {
    document.dispatchEvent(
      new CustomEvent(this.prefixEventName(eventName), {
        bubbles: true,
        detail: { message: message },
      }),
    );
  }

  sendEventFromFigma(eventType: string, message: string): void {
    const figmaEvent: IfigmaMessage = {
      type: eventType,
      message: message,
    };

    figma.ui.postMessage({ figmaEvent: figmaEvent });
    // How to catch
    //event.data.pluginMessage.figmaMessage.type
  }

  sendCustomEventFromUi(eventType: string, message: string): void {
    parent.postMessage({
      pluginMessage: {
        type: eventType,
        message: message,
      },
    });
    // How to catch
    //event.type or event.message
  }

  /**
   * @description It removes an event with an eventName and a callback function
   * @param {string} eventName - The name of the event that will be listened to
   * @param {function} callback - The function that is called when the event is triggered
   * @returns {void}
   */
  removeEvent(eventName: string, callback: EventListener): void {
    document.removeEventListener(this.prefixEventName(eventName), callback);
  }

  /**
   * @description Removes all events from the document.
   * @returns {void}
   */
  removeAllEvents(): void {
    if (!this.handlers) return;
    Object.keys(this.handlers).forEach((prefixedEventName) =>
      document.removeEventListener(prefixedEventName, this.handlers[prefixedEventName]),
    );
  }

  /**
   * @description It prefixes the event name with the string "Propertize_message_"
   * @param {string} eventName - The name of the event that will be listened to
   * @returns {string} - The prefixed event name: "Propertize_message_eventName"
   */
  prefixEventName(eventName: string): any {
    if (eventName === null || eventName === undefined)
      throw new Error("The event name is undefined");
    return "Propertize_message_" + eventName;
  }
}
