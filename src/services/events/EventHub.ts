// Class with all the events
export class EventHub {
  // Events
  btn_connect_event = "btn_connect_event";
  // Adding these events later
  // updateAnnotation
  // UpdateDataSource
  // updateEntity
  // updateAttribute
  // updateDataType

  /**
   * @description It creates an event listener
   * @param {string} eventType - The type of event to listen for
   * @param {function} callback - The function that is called when the event is triggered
   * @returns {void}
   */

  makeEvent(eventType: string, callback: EventListener): void {
    try {
      if (typeof callback !== "function") throw new TypeError("The callback must be a function");
      document.addEventListener(this.getEventName(eventType), callback);
      console.log("EventHub: Event created: ", this.getEventName(eventType)); // temporary - remove later
    } catch (error) {
      console.error("Error: ", error);
    }
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
}
