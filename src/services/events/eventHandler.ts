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

  // Function to get the name of the event to emit
  getEventName(messageType: string) {
    // if the type is null or undefined, return "message"
    if (messageType === null || messageType === undefined) {
      return "message";
    }

    // otherwise return "message-" followed by the type
    return "message-" + messageType;
  }
}
