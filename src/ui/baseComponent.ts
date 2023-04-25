export abstract class BaseComponent {
  abstract componentType: string;

  constructor() {
    window.addEventListener("message", (event) => {
      //event.data.pluginMessage.figmaMessage.type
      const initEvent = event.data.pluginMessage;
      if (initEvent.figmaMessage.type === "initialize" + this.componentType) {
        this.initComponent();
        console.log("initComponent", this.componentType);
      }
    });
  }

  abstract initComponent(): void;
}
