// Class to handle all events
export class EventHandler {
  private event: Event;

  constructor(event: Event) {
    this.event = event;
  }

  /**
   * Returns the event.
   * @param eventType - The type of event to listen for.
   * @param callback - The callback function to call when the event is triggered.
   */

  makeEvent(eventType: string, callback: EventListener) {
    try {
      document.addEventListener(eventType, callback);
    } catch (error) {
      console.error("Error: ", error);
    }
  }

  /**
   * Removes the given event listener from the event type.
   * @param eventType - The type of event to remove the listener from.
   * @param callback - The callback function to remove.
   */

  removeEvent(eventType: string, callback: EventListener) {
    try {
      document.removeEventListener(eventType, callback);
    } catch (error) {
      console.error("Error: ", error);
    }
  }

  /**
   * Dispatches a custom event.
   * @param {string} messageType
   * @param {string} message
   */

  sendMessage(messageType: string, message: string) {
    try {
      document.dispatchEvent(
        new CustomEvent(this.getEventName(messageType), {
          bubbles: true,
          detail: { message: message },
        }),
      );
    } catch (error) {
      const errorMessage = `Error sending message: ${error}`;
      console.log(errorMessage);
    }
  }

  // This function returns the name of an event which should be fired when a message of the given type is received.
  // If the message type is null or undefined, then the event name is simply "message". Otherwise, it is "message-<messageType>".
  getEventName(messageType: string) {
    if (messageType === null || messageType === undefined) {
      return "message";
    }
    return "message-" + messageType;
  }
}
