// Class with all the events
export class EventHub {
  handlers: any;
  // Events settings tab
  btn_connect_event = "btn_connect_event";
  api_initialized = "api_initialized";
  update_annotation = "update_annotation";
  // TODO: make a constante klasse, and make sure that only these event types can be used to create and send out events and also delete
  /**
   * @description It creates an event listener
   * @param {string} eventType - The type of event to listen for
   * @param {function} callback - The function that is called when the event is triggered
   * @returns {void}
   */

  makeEvent(eventName: string, callback: EventListener): void {
    if (eventName && eventName.trim() === "") throw new Error("The event name cannot be empty");
    if (typeof callback !== "function") throw new TypeError("The callback must be a function");
    if (!this.handlers) this.handlers = {};

    const prefixedEventName = this.prefixEventName(eventName);

    this.handlers[prefixedEventName] = (e: { detail: { message: Event } }) =>
      callback(e.detail.message);
    document.addEventListener(prefixedEventName, this.handlers[prefixedEventName]);
  }

  removeAllEvents(): void {
    if (!this.handlers) return;

    Object.keys(this.handlers).forEach(
      (prefixedEventName) =>
        document.removeEventListener(prefixedEventName, this.handlers[prefixedEventName]), // TODO: CHANGE ESLINT
    );
  }

  /**
   * @description It removes an event listener
   * @param {string} eventType - The type of event to remove
   * @param {function} callback - The function that is called when the event is triggered
   * @returns {void}
   */
  removeEvent(eventName: string, callback: EventListener): void {
    document.removeEventListener(this.prefixEventName(eventName), callback);
  }

  /**
   * @description It sends a custom event
   * @param {string} messageType - The type of message to send
   * @param {string} message - The message to send
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

  /**
   * @description It gets the event name
   * @param {string} messageType - The type of message to send
   * @returns {string} - The event name
   */
  prefixEventName(messageType: string): string {
    if (messageType === null || messageType === undefined) return "message";
    return "Propertize_message_" + messageType;
  }
}
