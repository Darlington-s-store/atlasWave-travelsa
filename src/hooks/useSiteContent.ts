import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteContentItem {
  id: string;
  section: string;
  key: string;
  value: Record<string, string>;
  updated_at: string;
}

interface HeroContent {
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  image_url?: string;
}

export interface HeroSlideContent {
  id: string;
  badge: string;
  title: string;
  highlight: string;
  title_end: string;
  description: string;
  cta_label: string;
  cta_link: string;
  cta_secondary_label: string;
  cta_secondary_link: string;
  image_url?: string;
  sort_order: string;
  active: string;
}

interface ServiceContent {
  title: string;
  description: string;
  icon: string;
  link?: string;
  active: string;
}

interface TestimonialContent {
  name: string;
  text: string;
  rating: string;
  role?: string;
  visible: string;
}

interface PartnerContent {
  name: string;
  category: string;
  logo_url?: string;
}

export interface DealContent {
  id: string;
  type: string;
  title: string;
  original_price: string;
  price: string;
  discount: string;
  deadline: string;
  tag: string;
  sort_order: string;
  active: string;
}

interface ContactContent {
  email: string;
  phone: string;
  address: string;
  hours: string;
}

// Shared cache to avoid redundant fetches across components
let contentCache: SiteContentItem[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5000; // 5 seconds

export function useSiteContent() {
  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [heroSlides, setHeroSlides] = useState<HeroSlideContent[]>([]);
  const [services, setServices] = useState<ServiceContent[]>([]);
  const [deals, setDeals] = useState<DealContent[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialContent[]>([]);
  const [partners, setPartners] = useState<PartnerContent[]>([]);
  const [contact, setContact] = useState<ContactContent | null>(null);

  const parseContent = useCallback((items: SiteContentItem[]) => {
    const heroItem = items.find(i => i.section === "hero" && i.key === "main");
    if (heroItem) setHero(heroItem.value as unknown as HeroContent);

    const contactItem = items.find(i => i.section === "contact" && i.key === "info");
    if (contactItem) setContact(contactItem.value as unknown as ContactContent);

    // Parse hero slides
    const slideItems = items
      .filter(i => i.section === "hero_slides" && i.value.active !== "false")
      .sort((a, b) => parseInt(a.value.sort_order || "0") - parseInt(b.value.sort_order || "0"));
    setHeroSlides(slideItems.map(i => ({ id: i.id, ...i.value } as unknown as HeroSlideContent)));

    const serviceItems = items.filter(i => i.section === "services" && i.value.active !== "false");
    setServices(serviceItems.map(i => i.value as unknown as ServiceContent));

    const dealItems = items
      .filter(i => i.section === "deals" && i.value.active !== "false")
      .sort((a, b) => parseInt(a.value.sort_order || "0") - parseInt(b.value.sort_order || "0"));
    setDeals(dealItems.map(i => ({ id: i.id, ...i.value } as unknown as DealContent)));

    const testimonialItems = items.filter(i => i.section === "testimonials" && i.value.visible !== "false");
    setTestimonials(testimonialItems.map(i => i.value as unknown as TestimonialContent));

    const partnerItems = items.filter(i => i.section === "partners");
    setPartners(partnerItems.map(i => i.value as unknown as PartnerContent));
  }, []);

  const fetchContent = useCallback(async (skipCache = false) => {
    // Use cache if fresh
    if (!skipCache && contentCache && Date.now() - cacheTimestamp < CACHE_TTL) {
      parseContent(contentCache);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("site_content")
      .select("*")
      .order("section", { ascending: true });

    if (!error && data) {
      const items = data as SiteContentItem[];
      contentCache = items;
      cacheTimestamp = Date.now();
      parseContent(items);
    }

    setLoading(false);
  }, [parseContent]);

  useEffect(() => {
    fetchContent();

    // Subscribe to realtime changes for instant updates
    const channel = supabase
      .channel("site_content_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_content" },
        () => {
          // Invalidate cache and refetch when any content changes
          contentCache = null;
          fetchContent(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchContent]);

  return { loading, hero, heroSlides, services, deals, testimonials, partners, contact, refetch: () => fetchContent(true) };
}

export function getStorageUrl(path: string | undefined): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from("cms-images").getPublicUrl(path);
  return data.publicUrl;
}
