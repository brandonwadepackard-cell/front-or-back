import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { AICopilot } from "@/components/AICopilot";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ContentGenerator from "./pages/ContentGenerator";
import ContentHistory from "./pages/ContentHistory";
import Templates from "./pages/Templates";
import Analytics from "./pages/Analytics";
import Calendar from "./pages/Calendar";
import BulkSchedule from "./pages/BulkSchedule";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/content" element={<ContentGenerator />} />
          <Route path="/history" element={<ContentHistory />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/bulk-schedule" element={<BulkSchedule />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AICopilot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
