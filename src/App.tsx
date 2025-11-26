import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { AICopilot } from "@/components/AICopilot";
import { PageTransition } from "@/components/PageTransition";
import { SwipeNavigation } from "@/components/SwipeNavigation";
import { useDeepLinks } from "@/hooks/use-deep-links";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ContentGenerator from "./pages/ContentGenerator";
import ContentHistory from "./pages/ContentHistory";
import Templates from "./pages/Templates";
import Analytics from "./pages/Analytics";
import Calendar from "./pages/Calendar";
import BulkSchedule from "./pages/BulkSchedule";
import Library from "./pages/Library";
import Scraper from "./pages/Scraper";
import ScraperResults from "./pages/ScraperResults";
import AdminDashboard from "./pages/AdminDashboard";
import NativeFeatures from "./pages/NativeFeatures";
import DeepLinking from "./pages/DeepLinking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  useDeepLinks(); // Initialize deep link handling

  return (
    <SwipeNavigation>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/content" element={<PageTransition><ContentGenerator /></PageTransition>} />
          <Route path="/history" element={<PageTransition><ContentHistory /></PageTransition>} />
          <Route path="/templates" element={<PageTransition><Templates /></PageTransition>} />
          <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
          <Route path="/calendar" element={<PageTransition><Calendar /></PageTransition>} />
          <Route path="/bulk-schedule" element={<PageTransition><BulkSchedule /></PageTransition>} />
          <Route path="/library" element={<PageTransition><Library /></PageTransition>} />
          <Route path="/scraper" element={<PageTransition><Scraper /></PageTransition>} />
          <Route path="/scraper/:jobId" element={<PageTransition><ScraperResults /></PageTransition>} />
          <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="/native-features" element={<PageTransition><NativeFeatures /></PageTransition>} />
          <Route path="/deep-linking" element={<PageTransition><DeepLinking /></PageTransition>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </SwipeNavigation>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <AnimatedRoutes />
        <AICopilot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
