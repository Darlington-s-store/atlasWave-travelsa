INSERT INTO public.site_content (section, key, value)
VALUES (
  'contact',
  'info',
  '{
    "email": "Info@atlaswavetravel.com",
    "phone": "+233548254334",
    "address": "Kasoa New Market, Accra, Ghana",
    "hours": "Monday - Friday: 8:00 AM - 6:00 PM GMT | Saturday: 9:00 AM - 3:00 PM GMT | Sunday: Closed (Online support available)"
  }'::jsonb
)
ON CONFLICT (section, key)
DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();
