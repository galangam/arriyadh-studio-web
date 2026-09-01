import "server-only";

import { unstable_rethrow } from "next/navigation";

import { aboutContentFallback } from "@/lib/content/content-fallbacks";
import { resolveContentImageUrl } from "@/lib/content/content-images";
import { createClient } from "@/lib/supabase/server";

export type AboutContent = {
  page_title: string;
  page_subtitle: string;
  history_title: string;
  history_body: string;
  founded_year: number | null;
  strength_1_title: string;
  strength_1_description: string;
  strength_2_title: string;
  strength_2_description: string;
  strength_3_title: string;
  strength_3_description: string;
  workshop_title: string;
  workshop_description: string;
  workshop_image_url: string | null;
};

type AboutContentRow = {
  [Key in keyof AboutContent]: AboutContent[Key] | null;
};

const columns =
  "page_title, page_subtitle, history_title, history_body, founded_year, strength_1_title, strength_1_description, strength_2_title, strength_2_description, strength_3_title, strength_3_description, workshop_title, workshop_description, workshop_image_url";

function withFallback(row: AboutContentRow | null): AboutContent {
  return {
    page_title: row?.page_title ?? aboutContentFallback.page_title,
    page_subtitle: row?.page_subtitle ?? aboutContentFallback.page_subtitle,
    history_title: row?.history_title ?? aboutContentFallback.history_title,
    history_body: row?.history_body ?? aboutContentFallback.history_body,
    founded_year: row?.founded_year ?? aboutContentFallback.founded_year,
    strength_1_title:
      row?.strength_1_title ?? aboutContentFallback.strength_1_title,
    strength_1_description:
      row?.strength_1_description ??
      aboutContentFallback.strength_1_description,
    strength_2_title:
      row?.strength_2_title ?? aboutContentFallback.strength_2_title,
    strength_2_description:
      row?.strength_2_description ??
      aboutContentFallback.strength_2_description,
    strength_3_title:
      row?.strength_3_title ?? aboutContentFallback.strength_3_title,
    strength_3_description:
      row?.strength_3_description ??
      aboutContentFallback.strength_3_description,
    workshop_title:
      row?.workshop_title ?? aboutContentFallback.workshop_title,
    workshop_description:
      row?.workshop_description ?? aboutContentFallback.workshop_description,
    workshop_image_url:
      row?.workshop_image_url ?? aboutContentFallback.workshop_image_url,
  };
}

export async function getAboutContent(): Promise<AboutContent> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("about_content")
      .select(columns)
      .eq("id", 1)
      .maybeSingle<AboutContentRow>();

    if (error) {
      console.error("[cms] About content could not be loaded", {
        code: error.code,
      });
      return withFallback(null);
    }

    const content = withFallback(data);

    return {
      ...content,
      workshop_image_url: await resolveContentImageUrl(
        content.workshop_image_url,
      ),
    };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[cms] About content read failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return withFallback(null);
  }
}
