import { useState, useEffect } from "react";
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

interface ContactContent {
  email: string;
  phone: string;
  address: string;
  hours: string;
}

export function useSiteContent() {
  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [services, setServices] = useState<ServiceContent[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialContent[]>([]);
  const [partners, setPartners] = useState<PartnerContent[]>([]);
  const [contact, setContact] = useState<ContactContent | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from("site_content")
      .select("*")
      .order("section", { ascending: true });

    if (!error && data) {
      const items = data as SiteContentItem[];

      // Parse hero
      const heroItem = items.find(i => i.section === "hero" && i.key === "main");
      if (heroItem) {
        setHero(heroItem.value as unknown as HeroContent);
      }

      // Parse contact
      const contactItem = items.find(i => i.section === "contact" && i.key === "info");
      if (contactItem) {
        setContact(contactItem.value as unknown as ContactContent);
      }

      // Parse services (only active ones)
      const serviceItems = items.filter(i => i.section === "services" && i.value.active !== "false");
      setServices(serviceItems.map(i => i.value as unknown as ServiceContent));

      // Parse testimonials (only visible ones)
      const testimonialItems = items.filter(i => i.section === "testimonials" && i.value.visible !== "false");
      setTestimonials(testimonialItems.map(i => i.value as unknown as TestimonialContent));

      // Parse partners
      const partnerItems = items.filter(i => i.section === "partners");
      setPartners(partnerItems.map(i => i.value as unknown as PartnerContent));
    }

    setLoading(false);
  };

  return { loading, hero, services, testimonials, partners, contact, refetch: fetchContent };
}

export function getStorageUrl(path: string | undefined): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from("cms-images").getPublicUrl(path);
  return data.publicUrl;
}
