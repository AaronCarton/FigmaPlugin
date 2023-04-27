import { IfigmaMessage } from "../../interfaces/interface.figmaMessage";

/* eslint-disable @typescript-eslint/no-explicit-any */ //! Should be fixed later
export default class EventHub {
  private static instance: EventHub;
  private handlers: { [eventName: string]: (event: any) => void } = {};

  /**
   * Get the instance of the EventHub
   * @returns {EventHub} The instance of the EventHub
   */
  public static getInstance(): EventHub {
    if (!EventHub.instance) EventHub.instance = new EventHub();
    return EventHub.instance;
  }

  /**
   * Creates an event listener for the given event type and calls the callback function when the event is triggered
   * @param {string} eventType - The name of the event that will be listened to
   * @param {function} callback - The function that will be called when the event is triggered
   */
  makeEvent(eventType: string, callback: (message: any) => void): void {
    if (eventType && eventType.trim() === "") throw new Error("The event type cannot be empty");
    if (typeof callback !== "function") throw new TypeError("The callback must be a function");
    const prefixedEventName = this.prefixEventName(eventType);

    // Check is event is for Figma or browser
    if (this.hasAccessToUI()) {
      // Store callback in handlers under event name (for later removal)
      this.handlers[prefixedEventName] = (event: any) => {
        if (event.data.pluginMessage.type === prefixedEventName) {
          callback(event.data.pluginMessage.message);
        }
      };
      // Register event listener in browser
      window.addEventListener("message", this.handlers[prefixedEventName]);
      console.debug(
        `[EVENT] Registered ${prefixedEventName} in Browser (ui.ts)`,
        this.handlers[prefixedEventName],
      );
    } else {
      // Store callback in handlers under event name (for later removal)
      this.handlers[prefixedEventName] = (event: any) => {
        if (event.type === eventType) {
          console.log("event.type", event.type);
          this.handlers[prefixedEventName];
          callback(event.message);
        }
      };
      // Register event listener in Figma
      figma.ui.onmessage = this.handlers[prefixedEventName];
      console.debug(
        `[EVENT] Register ${prefixedEventName} in Figma (code.ts)`,
        this.handlers[prefixedEventName],
      );
    }
  }

  /**
   * It sends a custom event with the eventName and a message
   * @param {string} eventType - The name of the event that will be sent
   * @param {any} message - The message that will be sent with the event
   */
  sendCustomEvent(eventType: string, message: any): void {
    const prefixedEventName = this.prefixEventName(eventType);
    // Check is event is for Figma or browser
    if (this.hasAccessToUI()) {
      const data = {
        pluginMessage: {
          type: prefixedEventName,
          message: message,
        },
      };
      // Send event to browser
      window.postMessage(data, "*");
      console.debug(`[EVENT] Emit ${prefixedEventName} to Browser (ui.ts)`, data);
    } else {
      const data: IfigmaMessage = {
        type: prefixedEventName,
        message: { messageObject: message },
      };
      // Send event to Figma
      figma.ui.postMessage(data);
      console.debug(`[EVENT] Emit ${prefixedEventName} to Figma (code.ts)`, data);
    }
  }

  /**
   * Removes event from the event listeners
   * @param {string} eventType - Event type that will be removed
   */
  removeEvent(eventType: string): void {
    const prefixedEventName = this.prefixEventName(eventType);
    if (this.hasAccessToUI()) {
      window.removeEventListener("message", this.handlers[prefixedEventName]);
    } else {
      figma.ui.off(prefixedEventName, this.handlers[prefixedEventName]);
    }
  }

  /**
   * Prefixes the event name with the string "Propertize_message_"
   * @param {string} eventName - Event name that will be prefixed
   * @returns {string} - The prefixed event name. Eg."Propertize_message_eventName"
   */
  prefixEventName(eventName: string): any {
    if (eventName === null || eventName === undefined)
      throw new Error("The event name is undefined");
    return "Propertize_message_" + eventName;
  }

  /**
   * Checks if the window and document objects are available, which means that the code is running from ui.ts, instead of code.ts
   * @returns True if running in ui.ts and False if running in code.ts
   */
  private hasAccessToUI() {
    return window && document;
  }
}
