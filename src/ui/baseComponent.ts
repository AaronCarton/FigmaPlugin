export abstract class BaseComponent {
  abstract componentType: string;

  abstract initComponent(): void;

  constructor() {
    window.addEventListener("message", (event) => {
      if (event.data.pluginMessage.type === "initialize" + this.componentType) {
        this.initComponent();
      }
    });
  }
}
