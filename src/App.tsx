import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ChatBot from "@/components/ChatBot";
import Index from "./pages/Index";
import About from "./pages/About";
import TravelServices from "./pages/TravelServices";
import FlightBooking from "./pages/FlightBooking";
import HotelAccommodation from "./pages/HotelAccommodation";
import VisaAssistance from "./pages/VisaAssistance";
import Logistics from "./pages/Logistics";
import WorkPermits from "./pages/WorkPermits";
import SchengenWorkPermits from "./pages/SchengenWorkPermits";
import CanadaLMIA from "./pages/CanadaLMIA";
import GermanyChancenkarte from "./pages/GermanyChancenkarte";
import UsaNclex from "./pages/UsaNclex";
import CredentialEvaluation from "./pages/CredentialEvaluation";
import Documentation from "./pages/Documentation";
import Consultation from "./pages/Consultation";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/travel" element={<TravelServices />} />
            <Route path="/travel/flights" element={<FlightBooking />} />
            <Route path="/travel/hotels" element={<HotelAccommodation />} />
            <Route path="/travel/visa" element={<VisaAssistance />} />
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
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatBot />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
