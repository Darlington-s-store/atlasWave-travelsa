-- Add 8 sample services to the site_content table
INSERT INTO public.site_content (section, key, value) VALUES
  (
    'services',
    'service_flight_booking',
    '{
      "title": "Flight Booking",
      "description": "Book flights to destinations worldwide with competitive rates and flexible options",
      "icon": "Plane",
      "link": "/flight-booking",
      "active": "true"
    }'::jsonb
  ),
  (
    'services',
    'service_hotel_reservations',
    '{
      "title": "Hotel Accommodations",
      "description": "Reserve luxury and budget-friendly hotels across the globe with exclusive deals",
      "icon": "Hotel",
      "link": "/hotel-accommodation",
      "active": "true"
    }'::jsonb
  ),
  (
    'services',
    'service_visa_assistance',
    '{
      "title": "Visa Assistance",
      "description": "Professional visa application support for Schengen, US, Canada and work permits",
      "icon": "FileCheck",
      "link": "/visa-assistance",
      "active": "true"
    }'::jsonb
  ),
  (
    'services',
    'service_work_permits',
    '{
      "title": "Work Permits",
      "description": "Navigate complex work permit requirements for Canada LMIA, Germany and other countries",
      "icon": "Briefcase",
      "link": "/work-permits",
      "active": "true"
    }'::jsonb
  ),
  (
    'services',
    'service_credential_evaluation',
    '{
      "title": "Credential Evaluation",
      "description": "Get your international credentials assessed and recognized by employers",
      "icon": "FileText",
      "link": "/credential-evaluation",
      "active": "true"
    }'::jsonb
  ),
  (
    'services',
    'service_shipment_tracking',
    '{
      "title": "Shipment Tracking",
      "description": "Real-time tracking and management of your cargo and packages worldwide",
      "icon": "Ship",
      "link": "/shipment-tracking",
      "active": "true"
    }'::jsonb
  ),
  (
    'services',
    'service_logistics',
    '{
      "title": "Logistics Management",
      "description": "Complete supply chain and logistics solutions for personal and corporate needs",
      "icon": "Truck",
      "link": "/logistics",
      "active": "true"
    }'::jsonb
  ),
  (
    'services',
    'service_travel_packages',
    '{
      "title": "Travel Packages",
      "description": "Custom travel packages including tours, cruises and adventure experiences",
      "icon": "Package",
      "link": "/travel-services",
      "active": "true"
    }'::jsonb
  );

-- Verify the services were inserted
-- SELECT COUNT(*) FROM public.site_content WHERE section = 'services';
