const connect: HTMLElement = document.querySelector(".js-connect")!
const settings: HTMLElement = document.querySelector(".js-settings")!
const usage: HTMLElement = document.querySelector(".js-usage")!

const connectView: HTMLElement = document.querySelector(".js-connect-view")!
const settingsView: HTMLElement = document.querySelector(".js-settings-view")!
const usageView: HTMLElement = document.querySelector(".js-usage-view")!

const navItems: NodeListOf<HTMLElement> = document.querySelectorAll(".js-nav-item")
const panelItems: NodeListOf<HTMLElement> = document.querySelectorAll(".js-panel-item")

const settingsIcon: HTMLElement = document.querySelector(".js-settings-icon")!

const isSelected = "is-selected"
const isActive = "is-active"

connect.addEventListener("click", function () {
  navItems.forEach((item) => {
    item.classList.remove(isSelected)
  })
  panelItems.forEach((item) => {
    item.classList.remove(isActive)
  })
  connect.classList.add(isSelected)
  connectView.classList.add(isActive)
  settingsIcon.classList.remove(isSelected)
})

settings.addEventListener("click", function () {
  navItems.forEach((item) => {
    item.classList.remove(isSelected)
  })
  panelItems.forEach((item) => {
    item.classList.remove(isActive)
  })
  settings.classList.add(isSelected)
  settingsView.classList.add(isActive)
  settingsIcon.classList.add(isSelected)
})

usage.addEventListener("click", function () {
  navItems.forEach((item) => {
    item.classList.remove(isSelected)
  })
  panelItems.forEach((item) => {
    item.classList.remove(isActive)
  })
  usage.classList.add(isSelected)
  usageView.classList.add(isActive)
  settingsIcon.classList.remove(isSelected)
})
