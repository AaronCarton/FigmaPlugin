export class Dlw_DOM_Message_Handler {
  constructor(scope) {
    this.scope = scope || "";
  }
  register(messageType, callback) {
    this.registerNamed(this.scope + messageType, messageType, callback);
  }
  registerNamed(name, messageType, callback) {
    if (!this.handlers) this.handlers = {};
    let key = this.getHandlerKey(name, messageType);
    this.handlers[key] = (e) => callback(e.detail.message);
    document.addEventListener(this.getEventName(messageType), this.handlers[key]);
  }
  unregisterNamed(name, messageType) {
    let key = this.getHandlerKey(name, messageType);
    if (!(this.handlers || {})[key]) return;
    document.removeEventListener(this.getEventName(messageType), this.handlers[key]);
  }
  unregisterAll() {
    this.unregisterAllNamedHandlers();
  }
  unregisterAllNamedHandlers() {
    if (!this.handlers) return;
    Object.keys(this.handlers).forEach((key) => {
      let messageType = key.split("----")[2];
      document.removeEventListener(this.getEventName(messageType), this.handlers[key]);
    });
  }
  getHandlerKey(name, messageType) {
    return [name, this.scope, messageType].join("----").toLowerCase();
  }
  getEventName(messageType) {
    return (this.scope + messageType).toLowerCase();
  }
  sendMessage(messageType, message) {
    document.dispatchEvent(
      new CustomEvent(this.getEventName(messageType), {
        bubbles: true,
        detail: { message: message },
      }),
    );
  }
}
