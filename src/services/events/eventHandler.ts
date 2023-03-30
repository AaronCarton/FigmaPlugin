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
}
