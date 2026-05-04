export const WEBSITE_GUIDE = [
  {
    path: "/",
    title: "Homepage",
    summary:
      "Introduces AtlastWave Travel and Tour, featured services, deals, approved reviews, contact highlights, and links into the main service areas.",
  },
  {
    path: "/about",
    title: "About",
    summary:
      "Explains the company background, mission, service approach, and the type of travel, immigration, and logistics support AtlastWave provides.",
  },
  {
    path: "/travel",
    title: "Travel Services",
    summary:
      "Overview page for travel support including flights, hotel accommodation, and visa guidance.",
  },
  {
    path: "/travel/flights",
    title: "Flight Booking",
    summary:
      "Lets users search flights, compare results, review fare details, and continue to booking and payment.",
  },
  {
    path: "/travel/hotels",
    title: "Hotel Accommodation",
    summary:
      "Lets users search hotels, review room options, provide guest details, and continue with reservation payment.",
  },
  {
    path: "/travel/visa",
    title: "Visa Assistance",
    summary:
      "Covers travel visa help, document guidance, application support, and consultation pathways for different destinations.",
  },
  {
    path: "/work-permits",
    title: "Work Permits",
    summary:
      "Main hub for work permit services and pathways offered by AtlastWave.",
  },
  {
    path: "/work-permits/schengen",
    title: "Schengen Work Permits",
    summary:
      "Provides information about European work permit support, eligibility guidance, and application assistance.",
  },
  {
    path: "/work-permits/canada-lmia",
    title: "Canada LMIA",
    summary:
      "Explains the Canada LMIA route, employer documentation expectations, and support available from AtlastWave.",
  },
  {
    path: "/work-permits/germany-chancenkarte",
    title: "Germany Chancenkarte",
    summary:
      "Covers Germany Opportunity Card guidance, requirements, and preparation support.",
  },
  {
    path: "/work-permits/usa-nclex",
    title: "USA NCLEX",
    summary:
      "Focuses on the USA NCLEX pathway for nurses and related migration guidance.",
  },
  {
    path: "/work-permits/credential-evaluation",
    title: "Credential Evaluation",
    summary:
      "Explains educational credential evaluation support used for migration and professional pathways.",
  },
  {
    path: "/logistics",
    title: "Logistics",
    summary:
      "Explains shipping, freight, customs support, and transport coordination for clients.",
  },
  {
    path: "/tracking",
    title: "Shipment Tracking",
    summary:
      "Allows users to check shipment status using a tracking number.",
  },
  {
    path: "/logistics/tracking",
    title: "Shipment Tracking",
    summary:
      "Alternative route to the shipment tracking experience.",
  },
  {
    path: "/documentation",
    title: "Documentation",
    summary:
      "Covers travel and immigration document support, preparation guidance, and submission help.",
  },
  {
    path: "/consultation",
    title: "Consultation",
    summary:
      "Allows users to book consultation sessions and review consultation packages and scheduling details.",
  },
  {
    path: "/payments",
    title: "Payments",
    summary:
      "Handles payment records, invoices, and service-related payment actions in Ghana cedis.",
  },
  {
    path: "/videos",
    title: "Gallery",
    summary:
      "Displays the website video gallery and promotional media.",
  },
  {
    path: "/contact",
    title: "Contact",
    summary:
      "Shows the main business phone number, email address, office location, and contact form details.",
  },
  {
    path: "/login",
    title: "User Login",
    summary:
      "Lets existing users sign in to manage bookings, applications, payments, and dashboard activity.",
  },
  {
    path: "/signup",
    title: "User Signup",
    summary:
      "Lets new users create an account for bookings, applications, and dashboard access.",
  },
  {
    path: "/dashboard",
    title: "User Dashboard",
    summary:
      "Shows profile activity, applications, bookings, payments, and personal account tools for signed-in users.",
  },
  {
    path: "/profile",
    title: "User Dashboard",
    summary:
      "Alternative route to the signed-in user dashboard.",
  },
] as const;

export const WEBSITE_GUIDE_TEXT = WEBSITE_GUIDE.map(
  (entry) => `- ${entry.title} (${entry.path}): ${entry.summary}`,
).join("\n");
