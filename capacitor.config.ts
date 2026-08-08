import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.shepherdai.app",
  appName: "Shepherd AI",
  webDir: "dist",
  server: {
    // Capacitor's built-in local server handles SPA routing
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: "#C4923A",
      showSpinner: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#C4923A",
    },
  },
  ios: {
    scheme: "ShepherdAI",
  },
};

export default config;
