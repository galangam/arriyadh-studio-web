import "server-only";

import { unstable_rethrow } from "next/navigation";

import { siteSettingsFallback } from "@/lib/content/content-fallbacks";
import { createClient } from "@/lib/supabase/server";

export type SiteSettings = {
  business_name: string;
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  operating_hours: string;
  maps_url: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
};

type SiteSettingsRow = { [Key in keyof SiteSettings]: string | null };

const columns =
  "business_name, whatsapp, phone, email, address, operating_hours, maps_url, instagram_url, facebook_url, tiktok_url";

function withFallback(row: SiteSettingsRow | null): SiteSettings {
  return {
    business_name: row?.business_name ?? siteSettingsFallback.business_name,
    whatsapp: row?.whatsapp ?? siteSettingsFallback.whatsapp,
    phone: row?.phone ?? siteSettingsFallback.phone,
    email: row?.email ?? siteSettingsFallback.email,
    address: row?.address ?? siteSettingsFallback.address,
    operating_hours:
      row?.operating_hours ?? siteSettingsFallback.operating_hours,
    maps_url: row?.maps_url ?? siteSettingsFallback.maps_url,
    instagram_url: row?.instagram_url ?? siteSettingsFallback.instagram_url,
    facebook_url: row?.facebook_url ?? siteSettingsFallback.facebook_url,
    tiktok_url: row?.tiktok_url ?? siteSettingsFallback.tiktok_url,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select(columns)
      .eq("id", 1)
      .maybeSingle<SiteSettingsRow>();

    if (error) {
      console.error("[cms] Site settings could not be loaded", {
        code: error.code,
      });
      return withFallback(null);
    }

    return withFallback(data);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[cms] Site settings read failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return withFallback(null);
  }
}
