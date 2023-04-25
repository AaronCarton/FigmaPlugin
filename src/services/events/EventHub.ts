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
