export abstract class BaseComponent {
  abstract componentType: string;

  constructor() {
    window.addEventListener("message", (event) => {
      if (event.data.pluginMessage.pluginMessage.type === "initialize" + this.componentType) {
        this.initializeComponent();
      }
    });
  }
  setComponentType(componentType: string) {
    this.componentType = componentType;
  }
  abstract initializeComponent(): void;
}
