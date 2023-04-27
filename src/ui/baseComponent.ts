export abstract class BaseComponent {
  abstract componentType: string;

  abstract initComponent(): void;

  constructor() {
    window.addEventListener("message", (event) => {
      //event.data.figmaMessage.type
      const initEvent = event.data.pluginMessage;
      if (initEvent.figmaMessage.type === "initialize" + this.componentType) {
        this.initComponent();
        console.log("initComponent", this.componentType);
      }
    });
  }
}
