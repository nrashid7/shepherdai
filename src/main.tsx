import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { isNativeApp } from "./lib/platform";

window.addEventListener("error", (event) => {
  console.error("[global error]", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("[unhandled rejection]", event.reason);
});

if (isNativeApp()) {
  import("@capacitor/status-bar").then(({ StatusBar, Style }) => {
    StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  });
  import("@capacitor/splash-screen").then(({ SplashScreen }) => {
    SplashScreen.hide().catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
