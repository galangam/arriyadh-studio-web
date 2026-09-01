import "server-only";

import { unstable_rethrow } from "next/navigation";

import {
  featuredProductFallbackSlugs,
  featuredServiceFallbackSlugs,
} from "@/lib/content/content-fallbacks";
import { getActiveProducts, type PublicProduct } from "@/lib/products/public-products";
import { getActiveServices, type PublicService } from "@/lib/services/public-services";
import { createClient } from "@/lib/supabase/server";

type FeaturedServiceRelation = {
  sort_order: number;
  services: { id: string };
};

type FeaturedProductRelation = {
  sort_order: number;
  products: { id: string };
};

function orderBySlugs<T extends { slug: string }>(
  items: T[],
  slugs: readonly string[],
) {
  const itemBySlug = new Map(items.map((item) => [item.slug, item]));
  return slugs.flatMap((slug) => {
    const item = itemBySlug.get(slug);
    return item ? [item] : [];
  });
}

async function getServiceFallback(): Promise<PublicService[]> {
  try {
    return orderBySlugs(await getActiveServices(), featuredServiceFallbackSlugs);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[cms] Featured service fallback could not be loaded", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return [];
  }
}

async function getProductFallback(): Promise<PublicProduct[]> {
  try {
    return orderBySlugs(await getActiveProducts(), featuredProductFallbackSlugs);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[cms] Featured product fallback could not be loaded", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return [];
  }
}

export async function getHomepageFeaturedServices(): Promise<PublicService[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("homepage_featured_services")
      .select("sort_order, services!inner(id)")
      .eq("homepage_id", 1)
      .eq("services.is_active", true)
      .order("sort_order", { ascending: true })
      .returns<FeaturedServiceRelation[]>();

    if (error || !data) {
      console.error("[cms] Featured service relations could not be loaded", {
        code: error?.code,
      });
      return getServiceFallback();
    }

    const activeServices = await getActiveServices();
    const serviceById = new Map(
      activeServices.map((service) => [service.id, service]),
    );

    return data.flatMap((relation) => {
      const service = serviceById.get(relation.services.id);
      return service ? [service] : [];
    });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[cms] Featured services read failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return getServiceFallback();
  }
}

export async function getHomepageFeaturedProducts(): Promise<PublicProduct[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("homepage_featured_products")
      .select("sort_order, products!inner(id)")
      .eq("homepage_id", 1)
      .eq("products.is_active", true)
      .order("sort_order", { ascending: true })
      .returns<FeaturedProductRelation[]>();

    if (error || !data) {
      console.error("[cms] Featured product relations could not be loaded", {
        code: error?.code,
      });
      return getProductFallback();
    }

    const activeProducts = await getActiveProducts();
    const productById = new Map(
      activeProducts.map((product) => [product.id, product]),
    );

    return data.flatMap((relation) => {
      const product = productById.get(relation.products.id);
      return product ? [product] : [];
    });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[cms] Featured products read failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return getProductFallback();
  }
}
