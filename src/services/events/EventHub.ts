// Class with all the events
export class EventHub {
  handlers: any;
  // Events settings tab
  btn_connect_event = "btn_connect_event";
  api_initialized = "api_initialized";
  update_annotation = "update_annotation"; // TODO - in progress

  /**
   * @description It creates an event listener
   * @param {string} eventType - The type of event to listen for
   * @param {function} callback - The function that is called when the event is triggered
   * @returns {void}
   */

  makeEvent(eventType: string, callback: EventListener): void {
    try {
      if (typeof callback !== "function") throw new TypeError("The callback must be a function");
      if (!this.handlers) this.handlers = {};
      const key = this.getHandlersKey(this.getEventName(eventType));
      this.handlers[key] = (e: { detail: { message: Event } }) => callback(e.detail.message);
      document.addEventListener(this.getEventName(eventType), this.handlers[key]);
      console.log("EventHub: Event created: ", this.getEventName(eventType)); // temporary - remove later
    } catch (error) {
      console.error("Error: ", error);
    }
  }

  removeAllEvents(): void {
    if (!this.handlers) return;
    Object.keys(this.handlers).forEach((key) => {
      try {
        const messageType = key.split("----")[2];
        document.removeEventListener(this.getEventName(messageType), this.handlers[key]);
      } catch (error) {
        console.log("Error: ", error);
      }
    });
  }

  /**
   * @description It removes an event listener
   * @param {string} eventType - The type of event to remove
   * @param {function} callback - The function that is called when the event is triggered
   * @returns {void}
   */
  removeEvent(eventType: string, callback: EventListener): void {
    try {
      document.removeEventListener(eventType, callback);
    } catch (error) {
      console.error("Error: ", error);
    }
  }

  /**
   * @description It sends a custom event
   * @param {string} messageType - The type of message to send
   * @param {string} message - The message to send
   * @returns {void}
   */
  sendCustomEvent(messageType: string, message: string): void {
    try {
      document.dispatchEvent(
        new CustomEvent(this.getEventName(messageType), {
          bubbles: true,
          detail: { message: message },
        }),
      );
      console.log("EventHub: Event sent: ", this.getEventName(messageType)); // temporary - remove later
    } catch (error) {
      const errorMessage = `Error sending message: ${error}`;
      console.log(errorMessage);
    }
  }

  /**
   * @description It gets the event name
   * @param {string} messageType - The type of message to send
   * @returns {string} - The event name
   */
  getEventName(messageType: string): string {
    if (messageType === null || messageType === undefined) return "message";
    return "Propertize:message-" + messageType;
  }

  getHandlersKey(key: string): string {
    return key;
  }
}
