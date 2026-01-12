import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { useCapacitorAuth } from "@/hooks/useCapacitorAuth";
import { AppLayout } from "@/layouts/AppLayout";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Reflect from "./pages/Reflect";
import ManualCheckIn from "./pages/ManualCheckIn";
import CoachingSession from "./pages/CoachingSession";
import LuminaChat from "./pages/LuminaChat";
import LibraryTopic from "./pages/LibraryTopic";
import ThoughtUnpacker from "./pages/ThoughtUnpacker";
import Journal from "./pages/Journal";
import Journals from "./pages/Journals";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to initialize Capacitor deep link handling
function CapacitorDeepLinkHandler({ children }: { children: React.ReactNode }) {
  useCapacitorAuth();
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CapacitorDeepLinkHandler>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Auth />} />
                  <Route element={<AppLayout />}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/journals" element={<Journals />} />
                    <Route path="/reflect" element={<Reflect />} />
                    <Route path="/lumina" element={<LuminaChat />} />
                    <Route path="/library/:topicId" element={<LibraryTopic />} />
                  </Route>
                  <Route path="/check-in/manual" element={<ManualCheckIn />} />
                  <Route path="/coaching-session" element={<CoachingSession />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CapacitorDeepLinkHandler>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
