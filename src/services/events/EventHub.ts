import { IfigmaMessage } from "../../interfaces/interface.figmaMessage";

export default class EventHub {
  private static instance: EventHub;
  handlers: any;

  //TODO: check documentation
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
  makeEvent(eventType: string, callback: EventListener): void {
    if (eventType && eventType.trim() === "") throw new Error("The event type cannot be empty");
    if (typeof callback !== "function") throw new TypeError("The callback must be a function");
    if (!this.handlers) this.handlers = {};

    const prefixedEventName = this.prefixEventName(eventType);
    if (!this.hasAccessToUI()) {
      console.log("we are in kut figma");
      figma.ui.onmessage = (event) => {
        if (event.type === eventType) {
          console.log("event.type", event.type);
          this.handlers[prefixedEventName];
          callback(event.message);
        }
      };
    } else {
      console.log("we are in the UI");
      document.addEventListener("message", (event) => {
        // this.handlers[prefixedEventName];
        console.log("event.type", event.type);
      });
    }
  }

  /**
   * @description It sends a custom event with the eventName and a message
   * @param {string} eventName - The name of the event that will be listened to
   * @param {string} message - The message that will be sent with the event
   * @returns {void}
   */
  sendCustomEvent(eventType: string, message: string): void {
    if (this.hasAccessToUI()) {
      parent.postMessage(
        {
          pluginMessage: {
            type: this.prefixEventName(eventType),
            message: message,
          },
        },
        "*",
      );
      // How to catch
      //event.type or event.message
    } else {
      const figmaEvent: IfigmaMessage = {
        type: this.prefixEventName(eventType),
        message: { messageObject: message },
      };
      figma.ui.postMessage({ figmaEvent: figmaEvent });
      // How to catch
      //event.data.pluginMessage.figmaMessage.type
    }
  }

  private hasAccessToUI() {
    return window && document;
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
