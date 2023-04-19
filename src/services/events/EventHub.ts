export default class EventHub {
  private static instance: EventHub;
  handlers: any;

  /**
   * Get the instance of the EventHub
   * @returns {EventHub} The instance of the EventHub
   * @throws {Error} If the EventHub has not been initialized
   */
  public static getInstance(): EventHub {
    if (!EventHub.instance) throw new Error("EventHub has not been initialized");
    return EventHub.instance;
  }

  /**
   * @description It creates an event listener
   * @param {string} eventName - The type of event to listen for
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
   * @description It removes an event listener
   * @param {string} eventName - The type of event to remove
   * @param {function} callback - The function that is called when the event is triggered
   * @returns {void}
   */
  removeEvent(eventName: string, callback: EventListener): void {
    document.removeEventListener(this.prefixEventName(eventName), callback);
  }

  /**
   * @description Removes all event listeners from the document.
   * @returns {void}
   */
  removeAllEvents(): void {
    if (!this.handlers) return;
    Object.keys(this.handlers).forEach((prefixedEventName) =>
      document.removeEventListener(prefixedEventName, this.handlers[prefixedEventName]),
    );
  }

  /**
   * @description It gets the event name
   * @param {string} messageType - The type of message to sends
   * @returns {string} - The event name
   */
  prefixEventName(messageType: string): string {
    if (messageType === null || messageType === undefined) return "message";
    return "Propertize_message_" + messageType;
  }
}
