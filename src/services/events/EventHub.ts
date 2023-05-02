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
      if (this.checkDuplicateEvent(eventType, cb)) {
        return console.warn(`[EVENT] Event ${prefixedEventName} already registered with that callback, skipping...`);
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
      console.debug(`[EVENT] Registered ${prefixedEventName} in Browser (ui.ts)`, this.handlers[prefixedEventName]);
    } else {
      // Check if event listener already exists
      if (this.checkDuplicateEvent(eventType, cb)) {
        return console.warn(`[EVENT] Event ${prefixedEventName} already registered with that callback, skipping...`);
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
      console.debug(`[EVENT] Register ${prefixedEventName} in Figma (code.ts)`, this.handlers[prefixedEventName]);
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
      parent.postMessage(data, "*");
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
   *
   * NOTE - if no callback is given it will remove all events with the given event type
   * @param {string} eventType - Event type that will be removed
   * @param {function} cb - Callback function that will be removed (optional)
   */
  removeEvent(eventType: string, cb?: (message: any) => void): void {
    const prefixedEventName = this.prefixEventName(eventType);
    // Filter handlers on eventType, and if cb is given also on callback
    const events = this.handlers.filter((e) => {
      return e.type === prefixedEventName && (!cb || e.originalCallback === cb);
    });
    if (events.length === 0) return console.warn(`[EVENT] Tried to remove unregistered ${prefixedEventName}, skipping`);

    // Check is event is for Figma or browser
    if (this.hasAccessToUI()) {
      events.forEach((event) => window.removeEventListener("message", event.callback));
    } else {
      events.forEach((event) => figma.ui.off(prefixedEventName, event.callback));
    }
    // Remove event from handlers
    this.handlers = this.handlers.filter((e) => !events.includes(e));
  }

  /**
   * Prefixes the event name with the string "Propertize_message_"
   * @param {string} eventName - Event name that will be prefixed
   * @returns {string} - The prefixed event name. Eg."Propertize_message_eventName"
   */
  prefixEventName(eventName: string): any {
    if (eventName === null || eventName === undefined) throw new Error("The event name is undefined");
    return "Propertize_message_" + eventName;
  }

  /**
   * Checks if the event is already registered
   * @param {string} eventType - Event type that will be checked
   * @param {function} cb - Callback function that will be checked
   * @returns {boolean} - True if the event is already registered, False if not
   */
  private checkDuplicateEvent(eventType: string, cb: (message: any) => void): boolean {
    return this.handlers.some((event) => event.type === this.prefixEventName(eventType) && event.originalCallback.toString() === cb.toString());
  }
  /**
   * Checks if the window and document objects are available, which means that the code is running from ui.ts, instead of code.ts
   * @returns True if running in ui.ts and False if running in code.ts
   */
  private hasAccessToUI() {
    return window && document;
  }
}
