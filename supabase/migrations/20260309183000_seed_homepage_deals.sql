INSERT INTO public.site_content (section, key, value)
VALUES
  (
    'deals',
    'deal_accra_london',
    '{
      "type": "Flight",
      "title": "Accra -> London Return",
      "original_price": "GHs 13,530",
      "price": "GHs 9,865",
      "discount": "27% OFF",
      "deadline": "2026-04-15T00:00:00",
      "tag": "Hot Deal",
      "sort_order": "0",
      "active": "true"
    }'::jsonb
  ),
  (
    'deals',
    'deal_dubai_marina',
    '{
      "type": "Hotel",
      "title": "5 Star Dubai Marina - 3 Nights",
      "original_price": "GHs 10,944",
      "price": "GHs 7,585",
      "discount": "31% OFF",
      "deadline": "2026-04-10T00:00:00",
      "tag": "Limited",
      "sort_order": "1",
      "active": "true"
    }'::jsonb
  ),
  (
    'deals',
    'deal_istanbul_cappadocia',
    '{
      "type": "Package",
      "title": "Istanbul + Cappadocia - 7 Days",
      "original_price": "GHs 21,280",
      "price": "GHs 15,960",
      "discount": "25% OFF",
      "deadline": "2026-04-20T00:00:00",
      "tag": "Popular",
      "sort_order": "2",
      "active": "true"
    }'::jsonb
  ),
  (
    'deals',
    'deal_lagos_toronto',
    '{
      "type": "Flight",
      "title": "Lagos -> Toronto One-Way",
      "original_price": "GHs 12,920",
      "price": "GHs 9,424",
      "discount": "27% OFF",
      "deadline": "2026-04-12T00:00:00",
      "tag": "Flash Sale",
      "sort_order": "3",
      "active": "true"
    }'::jsonb
  )
ON CONFLICT (section, key) DO UPDATE
SET
  value = EXCLUDED.value,
  updated_at = now();
