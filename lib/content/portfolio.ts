import "server-only";

import { unstable_rethrow } from "next/navigation";

import { portfolioFallback } from "@/lib/content/content-fallbacks";
import { resolveContentImageUrl } from "@/lib/content/content-images";
import { createClient } from "@/lib/supabase/server";

export type PublicPortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  alt: string;
};

type PortfolioRow = Omit<PublicPortfolioItem, "alt">;

const fallbackItems: PublicPortfolioItem[] = portfolioFallback.map((item) => ({
  ...item,
}));

export async function getPublicPortfolio(): Promise<PublicPortfolioItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("portfolio")
      .select("id, title, description, image_url")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .returns<PortfolioRow[]>();

    if (error || !data) {
      console.error("[cms] Public portfolio could not be loaded", {
        code: error?.code,
      });
      return fallbackItems;
    }

    if (data.length === 0) return fallbackItems;

    return Promise.all(
      data.map(async (item) => ({
        ...item,
        image_url: (await resolveContentImageUrl(item.image_url)) ?? item.image_url,
        alt: item.title,
      })),
    );
  } catch (error) {
    unstable_rethrow(error);
    console.error("[cms] Public portfolio read failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return fallbackItems;
  }
}
