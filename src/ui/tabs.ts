const connect = document.querySelector(".js-connect");
const settings = document.querySelector(".js-settings");
const usage = document.querySelector(".js-usage");

const connectView = document.querySelector(".js-connect-view");
const settingsView = document.querySelector(".js-settings-view");
const usageView = document.querySelector(".js-usage-view");

const settingsIcon = document.querySelector(".js-settings-icon");

connect?.addEventListener("click", function () {
  connect?.classList.add("selected");
  settings?.classList.remove("selected");
  usage?.classList.remove("selected");
  connectView?.classList.remove("close");
  settingsView?.classList.add("close");
  usageView?.classList.add("close");
  settingsIcon?.classList.remove("selected");
});

settings?.addEventListener("click", function () {
  settings?.classList.add("selected");
  connect?.classList.remove("selected");
  usage?.classList.remove("selected");
  settingsView?.classList.remove("close");
  connectView?.classList.add("close");
  usageView?.classList.add("close");
  settingsIcon?.classList.add("selected");
});

usage?.addEventListener("click", function () {
  usage?.classList.add("selected");
  connect?.classList.remove("selected");
  settings?.classList.remove("selected");
  usageView?.classList.remove("close");
  connectView?.classList.add("close");
  settingsView?.classList.add("close");
  settingsIcon?.classList.remove("selected");
});