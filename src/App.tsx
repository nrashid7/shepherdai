import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import ChatPage from "./pages/ChatPage";
import PrayerPage from "./pages/PrayerPage";
import DashboardPage from "./pages/DashboardPage";
import DevotionalPage from "./pages/DevotionalPage";
import VersePage from "./pages/VersePage";
import AuthPage from "./pages/AuthPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/prayer" element={<PrayerPage />} />
            <Route path="/devotional" element={<DevotionalPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/verse" element={<VersePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
