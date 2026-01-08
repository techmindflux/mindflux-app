import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/layouts/AppLayout";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Reflect from "./pages/Reflect";
import CheckInOptions from "./pages/CheckInOptions";
import VoiceCheckIn from "./pages/VoiceCheckIn";
import ManualCheckIn from "./pages/ManualCheckIn";
import CoachingSession from "./pages/CoachingSession";
import LuminaChat from "./pages/LuminaChat";
import LibraryTopic from "./pages/LibraryTopic";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Auth />} />
              <Route element={<AppLayout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/reflect" element={<Reflect />} />
              <Route path="/lumina" element={<LuminaChat />} />
              <Route path="/library/:topicId" element={<LibraryTopic />} />
              </Route>
              <Route path="/check-in" element={<CheckInOptions />} />
              <Route path="/check-in/voice" element={<VoiceCheckIn />} />
              <Route path="/check-in/manual" element={<ManualCheckIn />} />
              <Route path="/coaching-session" element={<CoachingSession />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
