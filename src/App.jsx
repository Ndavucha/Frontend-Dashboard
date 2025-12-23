import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/index";
import BuyerDashboard from "./pages/BuyerDashboard";
import Procurement from "./pages/Procurement";
import Farmers from "./pages/Farmers";
import Contracts from "./pages/Contracts";
import Aggregators from "./pages/Aggregators";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/buyer" element={<BuyerDashboard/>} />
          <Route path="/procurement" element={<Procurement/>} />
          <Route path="/farmers" element={<Farmers/>} />
          <Route path="/contracts" element={<Contracts/>} />
          <Route path="/aggregators" element={<Aggregators />} />
          <Route path="/analytics" element={<Analytics/>} />
          <Route path="/settings" element={<Settings/>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
