/* eslint-disable func-style */
/* eslint-disable @typescript-eslint/no-explicit-any */ //! Should be fixed later
import { IfigmaMessage } from "../../interfaces/interface.figmaMessage";

interface Event {
  type: string;
  callback: EventListener;
  originalCallback: (message: any) => void;
}

export default class EventHub {
  private static instance: EventHub;
  private handlers: Event[] = [];

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
   * @param {function} cb - The function that will be called when the event is triggered
   */
  makeEvent(eventType: string, cb: (message: any) => void): void {
    if (eventType && eventType.trim() === "") throw new Error("The event type cannot be empty");
    if (typeof cb !== "function") throw new TypeError("The callback must be a function");
    const prefixedEventName = this.prefixEventName(eventType);

    // Check is event is for Figma or browser
    if (this.hasAccessToUI()) {
      // Check if event listener already exists
      const foundEvent = this.handlers.find((h) => h.type === prefixedEventName);
      if (foundEvent && foundEvent.originalCallback.toString() === cb.toString()) {
        return console.warn(
          `[EVENT] Event ${prefixedEventName} already registered with that callback, skipping...`,
        );
      }

      // Store callback in handlers (for later removal)
      const callback = (event: any) => {
        if (event.data.pluginMessage.type === prefixedEventName) {
          cb(event.data.pluginMessage.message);
        }
      };
      this.handlers.push({
        type: prefixedEventName,
        originalCallback: cb,
        callback,
      });

      // Register event listener in browser
      window.addEventListener("message", callback);
      console.debug(
        `[EVENT] Registered ${prefixedEventName} in Browser (ui.ts)`,
        this.handlers[prefixedEventName],
      );
    } else {
      // Check if event listener already exists
      const foundEvent = this.handlers.find((h) => h.type === prefixedEventName);
      if (foundEvent && foundEvent.originalCallback.toString() === cb.toString()) {
        return console.warn(
          `[EVENT] Event ${prefixedEventName} already registered with that callback, skipping...`,
        );
      }

      // Store callback in handlers (for later removal)
      const callback = (event: any) => {
        if (event.type === eventType) {
          cb(event.message);
        }
      };
      this.handlers.push({
        type: prefixedEventName,
        originalCallback: cb,
        callback,
      });

      // Register event listener in Figma
      figma.ui.onmessage = callback;
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
    // Try and find event listener in handlers
    const event = this.handlers.find((h) => h.type === prefixedEventName)?.callback;
    if (!event)
      return console.warn(`[EVENT] Tried to remove unregistered ${prefixedEventName}, skipping`);

    // Check is event is for Figma or browser
    if (this.hasAccessToUI()) {
      window.removeEventListener("message", event);
    } else {
      figma.ui.off(prefixedEventName, event);
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
