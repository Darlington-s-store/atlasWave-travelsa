import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import ChatBot from "@/components/ChatBot";
import Preloader from "@/components/Preloader";
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
import AdminChatbot from "./pages/admin/AdminChatbot";
import AdminShipments from "./pages/admin/AdminShipments";
import AdminRefunds from "./pages/admin/AdminRefunds";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminFlights from "./pages/admin/AdminFlights";
import AdminHotels from "./pages/admin/AdminHotels";
import AdminVisaApplications from "./pages/admin/AdminVisaApplications";
import AdminWorkPermits from "./pages/admin/AdminWorkPermits";
import AdminCredentials from "./pages/admin/AdminCredentials";
import AdminCustoms from "./pages/admin/AdminCustoms";
import AdminConsultations from "./pages/admin/AdminConsultations";
import AdminDocumentation from "./pages/admin/AdminDocumentation";
import AdminDeals from "./pages/admin/AdminDeals";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminReports from "./pages/admin/AdminReports";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminDestinations from "./pages/admin/AdminDestinations";
import Payments from "./pages/Payments";
import ShipmentTracking from "./pages/ShipmentTracking";
import VideoGallery from "./pages/VideoGallery";
import AdminVideos from "./pages/admin/AdminVideos";
import Destinations from "./pages/Destinations";
import DestinationDetail from "./pages/DestinationDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const showChatBot = !location.pathname.startsWith("/admin");

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/travel" element={<TravelServices />} />
        <Route path="/travel-services" element={<TravelServices />} />
        <Route path="/travel/flights" element={<FlightBooking />} />
        <Route path="/flight-booking" element={<FlightBooking />} />
        <Route path="/travel/hotels" element={<HotelAccommodation />} />
        <Route path="/hotel-accommodation" element={<HotelAccommodation />} />
        <Route path="/travel/visa" element={<VisaAssistance />} />
        <Route path="/visa-assistance" element={<VisaAssistance />} />
        <Route path="/logistics" element={<Logistics />} />
        <Route path="/logistics/tracking" element={<ShipmentTracking />} />
        <Route path="/tracking" element={<ShipmentTracking />} />
        <Route path="/shipment-tracking" element={<ShipmentTracking />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/videos" element={<VideoGallery />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/destinations/:id" element={<DestinationDetail />} />
        <Route path="/work-permits" element={<WorkPermits />} />
        <Route path="/work-permits/schengen" element={<SchengenWorkPermits />} />
        <Route path="/work-permits/canada-lmia" element={<CanadaLMIA />} />
        <Route path="/work-permits/germany-chancenkarte" element={<GermanyChancenkarte />} />
        <Route path="/work-permits/usa-nclex" element={<UsaNclex />} />
        <Route path="/work-permits/credential-evaluation" element={<CredentialEvaluation />} />
        <Route path="/credential-evaluation" element={<CredentialEvaluation />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminOverview />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/roles" element={<AdminRoles />} />
        <Route path="/admin/flights" element={<AdminFlights />} />
        <Route path="/admin/hotels" element={<AdminHotels />} />
        <Route path="/admin/deals" element={<AdminDeals />} />
        <Route path="/admin/applications" element={<AdminVisaApplications />} />
        <Route path="/admin/work-permits" element={<AdminWorkPermits />} />
        <Route path="/admin/credentials" element={<AdminCredentials />} />
        <Route path="/admin/shipments" element={<AdminShipments />} />
        <Route path="/admin/customs" element={<AdminCustoms />} />
        <Route path="/admin/consultations" element={<AdminConsultations />} />
        <Route path="/admin/documentation" element={<AdminDocumentation />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/refunds" element={<AdminRefunds />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/chatbot" element={<AdminChatbot />} />
        <Route path="/admin/content" element={<AdminContent />} />
        <Route path="/admin/videos" element={<AdminVideos />} />
        <Route path="/admin/blog" element={<AdminBlog />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/destinations" element={<AdminDestinations />} />
        <Route path="/admin/security" element={<AdminSecurity />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showChatBot && <ChatBot />}
    </>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const [isLoading, setIsLoading] = useState(() => {
    if (location.pathname !== "/" || location.pathname.startsWith("/admin")) {
      return false;
    }

    return window.sessionStorage.getItem("atlaswave-preloader-seen") !== "true";
  });

  useEffect(() => {
    if (isAdminRoute || location.pathname !== "/") {
      setIsLoading(false);
      return;
    }

    const hasSeenPreloader = window.sessionStorage.getItem("atlaswave-preloader-seen") === "true";
    if (hasSeenPreloader) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem("atlaswave-preloader-seen", "true");
      setIsLoading(false);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [isAdminRoute, location.pathname]);

  if (isAdminRoute) {
    return <AppRoutes />;
  }

  if (isLoading) {
    return <Preloader />;
  }

  return <AppRoutes />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatePresence mode="wait">
              <AppContent />
            </AnimatePresence>
          </BrowserRouter>
        </TooltipProvider>
      </AdminProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
