import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminContent from "./pages/admin/AdminContent";
import AdminPayments from "./pages/admin/AdminPayments";
import Payments from "./pages/Payments";
import ShipmentTracking from "./pages/ShipmentTracking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminProvider>
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
              <Route path="/work-permits/credential-evaluation" element={<CredentialEvaluation />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/consultation" element={<Consultation />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminOverview />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/applications" element={<AdminApplications />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/content" element={<AdminContent />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ChatBot />
          </BrowserRouter>
        </TooltipProvider>
      </AdminProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
