export { APPS_REPOSITORY } from "./constants/apps-repository";
export { DesktopProvider } from "./context/desktop.context";
export { default as Desktop } from "./components/desktop";
export { useDesktopActions, useDesktopState } from "./context/desktop.hook";
export { clearOpenedApps } from "./utils/opened-apps-storage";
