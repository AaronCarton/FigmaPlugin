/* eslint-disable func-style */
/* eslint-disable @typescript-eslint/no-explicit-any */ //! Should be fixed later
import { EventMap } from "../../interfaces/interface.EventHub";
import { Events } from "./Events";

interface Event {
  type: string;
  callback: EventListener;
  originalCallback: (message: any) => void;
}

export default class EventHub {
  private static instance: EventHub;
  private handlers: Event[] = [];

  /**
   * Creates an instance of the EventHub if it doesn't exist and returns it if it does
   * @returns {EventHub} The instance of the EventHub
   */
  public static getInstance() {
    if (!EventHub.instance) EventHub.instance = new EventHub();
    return EventHub.instance;
  }

  /**
   * Registers an EventListener for a specified eventType, and invokes a callback function when the event is triggered
   * @param {string} eventType - The name of the event that will be registered
   * @param {function} cb - The callback function that will be invoked when the event is triggered
   */
  makeEvent<T extends Events>(eventType: T, cb: (message: EventMap[T]) => void): void {
    if (!eventType) throw new Error("The event type cannot be empty");
    if (typeof cb !== "function") throw new TypeError("The callback must be a function");
    const prefixEventType = this.prefixEventType(eventType);

    // Check if event listener is already registered
    if (this.checkDuplicateEvent(eventType, cb)) {
      return console.warn(`[EVENT] Event ${prefixEventType} already registered with that callback, skipping...`);
    }

    // Construct event listener callback
    const callback = (event: any) => {
      // Check payload matches that of a plugin event (else it'll be a Figma.UI event)
      //! This might change in the future if plugin events are no longer wrapped in a pluginMessage
      if (event.data?.pluginMessage && event.data.pluginMessage.type === prefixEventType) {
        cb(event.data.pluginMessage.message);
      } else if (event.type === prefixEventType) {
        cb(event.message);
      }
    };

    // Store event listener in handlers
    this.handlers.push({
      type: prefixEventType,
      originalCallback: cb,
      callback,
    });

    if (this.hasAccessToUI()) {
      // Register event listener in plugin
      window.addEventListener("message", callback);
      console.debug(`[EVENT] Registered ${prefixEventType} in Browser (ui.ts)`);
    } else {
      // Register event listener in Figma
      figma.ui.on("message", callback);
      console.info(`[EVENT] Register ${prefixEventType} in Figma (code.ts)`); //? Figma node doesn't seem to have a console.debug
    }
  }

  /**
   * Sends a custom event with a give eventType and a message to either the Figma editor or the browser
   * @param {string} eventType - The name of the event that will be sent
   * @param {any} message - The message that will be sent with the event
   * @param {boolean} suppressLog - If true, the event will not be logged to the console
   */
  sendCustomEvent<T extends Events>(eventType: T, message: EventMap[T], suppressLog = false): void {
    const prefixEventType = this.prefixEventType(eventType);
    const data = {
      type: prefixEventType,
      message: message,
    };

    // Check is event is for Figma or browser
    if (this.hasAccessToUI()) {
      // Send event to browser
      // TODO: Check if it is still needed to send to both parent and window.
      // TODO: Also check if it is still necessary to wrap the data in a pluginMessage,
      // TODO: would it fail to differentiate between plugin and browser events in the callback if not?
      // TODO: Is it even necessary to differentiate them?
      parent.postMessage({ pluginMessage: data }, "*");
      window.postMessage({ pluginMessage: data }, "*");
      if (!suppressLog) console.debug(`[EVENT] Emit ${prefixEventType} to Browser (ui.ts)`, data);
    } else {
      // Send event to Figma
      figma.ui.postMessage(data);
      if (!suppressLog) console.info(`[EVENT] Emit ${prefixEventType} to Figma (code.ts)`, data); //? Figma node doesn't seem to have a console.debug
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
    const prefixEventType = this.prefixEventType(eventType);
    // Filter handlers on eventType, and if cb is given also on callback
    const events = this.handlers.filter((e) => {
      return e.type === prefixEventType && (!cb || e.originalCallback === cb);
    });
    if (events.length === 0) return console.warn(`[EVENT] Tried to remove unregistered ${prefixEventType}, skipping`);

    // Check is event is for Figma or browser
    if (this.hasAccessToUI()) {
      events.forEach((event) => window.removeEventListener("message", event.callback));
    } else {
      events.forEach((event) => figma.ui.off(prefixEventType, event.callback));
    }
    // Remove event from handlers
    this.handlers = this.handlers.filter((e) => !events.includes(e));
  }

  /**
   * Prefixes the eventType with the string "PROPERTIZE_MESSAGE_"
   * @param {string} eventType - Event type that will be prefixed
   * @returns {string} - The prefixed event type. Eg."PROPERTIZE_MESSAGE_EVENT_TYPE"
   */
  prefixEventType(eventType: string): any {
    if (!eventType) throw new Error("The event type cannot be empty");
    return `PROPERTIZE_MESSAGE_${eventType}`;
  }

  /**
   * Checks if the event is already registered
   * @param {string} eventType - Event type that will be checked
   * @param {function} cb - Callback function that will be checked
   * @returns {boolean} - True if the event is already registered, False if not
   */
  checkDuplicateEvent(eventType: string, cb: (message: any) => void): boolean {
    return this.handlers.some((event) => event.type === this.prefixEventType(eventType) && event.originalCallback.toString() === cb.toString());
  }

  /**
   * Checks if the window and document objects are available, which means that the code is running from ui.ts, instead of code.ts
   * @returns True if running in ui.ts and False if running in code.ts
   */
  private hasAccessToUI() {
    return window && document;
  }

  getHandlers(): Event[] {
    return this.handlers;
  }
}
