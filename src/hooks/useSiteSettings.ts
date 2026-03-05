import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  site_name: string;
  tagline: string;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  default_affiliate_commission: number | null;
}

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "SafariHorizons",
  tagline: "Experience the Wild",
  logo_url: null,
  contact_email: "info@safarihorizons.com",
  contact_phone: "+254 700 123 456",
  default_affiliate_commission: 10,
};

let cachedSettings: SiteSettings | null = null;

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(cachedSettings || DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    if (cachedSettings) return;
    const fetch = async () => {
      const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
      if (data) {
        cachedSettings = data as SiteSettings;
        setSettings(cachedSettings);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return { settings, loading };
};

/** Split site name into brand parts for styled rendering */
export const splitBrandName = (name: string) => {
  // If the name has a capital in the middle, split there (e.g., SafariHorizons -> Safari + Horizons)
  const match = name.match(/^([A-Z][a-z]+)([A-Z].*)$/);
  if (match) return { first: match[1], accent: match[2] };
  return { first: name, accent: "" };
};
