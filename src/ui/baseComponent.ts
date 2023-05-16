import EventHub from "../services/events/EventHub";
import { Events } from "../services/events/Events";

export abstract class BaseComponent {
  abstract componentType: string;

  abstract initComponent(): void;

  constructor() {
    window.addEventListener("message", (event) => {
      const eventType = EventHub.getInstance().prefixEventType(Events.UI_INITIALIZE_COMPONENT);

      if (event.data.pluginMessage.type === eventType && event.data.pluginMessage.message === this.componentType) {
        this.initComponent();
      }
    });
  }
}
