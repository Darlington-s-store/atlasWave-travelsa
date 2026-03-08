import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import TravelServices from "./pages/TravelServices";
import Logistics from "./pages/Logistics";
import WorkPermits from "./pages/WorkPermits";
import SchengenWorkPermits from "./pages/SchengenWorkPermits";
import CanadaLMIA from "./pages/CanadaLMIA";
import GermanyChancenkarte from "./pages/GermanyChancenkarte";
import UsaNclex from "./pages/UsaNclex";
import Documentation from "./pages/Documentation";
import Consultation from "./pages/Consultation";
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
          <Route path="/about" element={<About />} />
          <Route path="/travel" element={<TravelServices />} />
          <Route path="/travel/flights" element={<TravelServices />} />
          <Route path="/travel/hotels" element={<TravelServices />} />
          <Route path="/travel/visa" element={<TravelServices />} />
          <Route path="/logistics" element={<Logistics />} />
          <Route path="/tracking" element={<Logistics />} />
          <Route path="/work-permits" element={<WorkPermits />} />
          <Route path="/work-permits/schengen" element={<SchengenWorkPermits />} />
          <Route path="/work-permits/canada-lmia" element={<CanadaLMIA />} />
          <Route path="/work-permits/germany-chancenkarte" element={<GermanyChancenkarte />} />
          <Route path="/work-permits/usa-nclex" element={<UsaNclex />} />
          <Route path="/work-permits/credential-evaluation" element={<WorkPermits />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/consultation" element={<Consultation />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
