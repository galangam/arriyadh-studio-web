import "server-only";

import { unstable_rethrow } from "next/navigation";

import { homepageContentFallback } from "@/lib/content/content-fallbacks";
import { resolveContentImageUrl } from "@/lib/content/content-images";
import { createClient } from "@/lib/supabase/server";

export type HomepageContent = {
  hero_eyebrow: string;
  hero_title: string;
  hero_description: string;
  hero_image_url: string | null;
  intro_title: string;
  intro_description: string;
  experience_value: string | null;
  experience_label: string | null;
  portfolio_title: string;
  portfolio_description: string;
};

type HomepageContentRow = {
  [Key in keyof HomepageContent]: HomepageContent[Key] | null;
};

const columns =
  "hero_eyebrow, hero_title, hero_description, hero_image_url, intro_title, intro_description, experience_value, experience_label, portfolio_title, portfolio_description";

function withFallback(row: HomepageContentRow | null): HomepageContent {
  return {
    hero_eyebrow: row?.hero_eyebrow ?? homepageContentFallback.hero_eyebrow,
    hero_title: row?.hero_title ?? homepageContentFallback.hero_title,
    hero_description:
      row?.hero_description ?? homepageContentFallback.hero_description,
    hero_image_url:
      row?.hero_image_url ?? homepageContentFallback.hero_image_url,
    intro_title: row?.intro_title ?? homepageContentFallback.intro_title,
    intro_description:
      row?.intro_description ?? homepageContentFallback.intro_description,
    experience_value:
      row?.experience_value ?? homepageContentFallback.experience_value,
    experience_label:
      row?.experience_label ?? homepageContentFallback.experience_label,
    portfolio_title:
      row?.portfolio_title ?? homepageContentFallback.portfolio_title,
    portfolio_description:
      row?.portfolio_description ?? homepageContentFallback.portfolio_description,
  };
}

export async function getHomepageContent(): Promise<HomepageContent> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("homepage_content")
      .select(columns)
      .eq("id", 1)
      .maybeSingle<HomepageContentRow>();

    if (error) {
      console.error("[cms] Homepage content could not be loaded", {
        code: error.code,
      });
      return withFallback(null);
    }

    const content = withFallback(data);

    return {
      ...content,
      hero_image_url: await resolveContentImageUrl(content.hero_image_url),
    };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[cms] Homepage content read failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return withFallback(null);
  }
}
