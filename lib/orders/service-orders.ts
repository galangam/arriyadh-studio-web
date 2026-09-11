import "server-only";

import {
  validateDesignReferences,
  type ValidatedDesignReference,
} from "@/lib/orders/design-reference";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getDesignReferenceRequirement,
  getJerseyVariantMaterials,
  getServiceVariantMaterials,
  isJerseyVariantType,
  isServiceVariantSleeveType,
  isServiceVariantSize,
  isDesignOrientedService,
  maxServiceOrderQuantity,
  maxServiceVariantCount,
  type ServiceVariantInput,
} from "@/lib/services/service-requirements";
import {
  publicServiceFlows,
  type PublicServiceFlow,
} from "@/lib/services/public-services";
import { isOtherService } from "@/lib/orders/order-presentation";

export type ServiceOrderInput = {
  serviceId: string;
  customerName: string;
  customerWhatsapp: string;
  quantity: number | null;
  customerCompany: string | null;
  customerEmail: string | null;
  shippingAddress: string | null;
  requirement: string;
  material: string;
  designDescription: string;
  designReferences: File[];
  variants: ServiceVariantInput[];
};

type ActiveServiceForOrder = {
  id: string;
  slug: string;
  flow: string;
};

type CreatedServiceOrder = {
  id: string;
  order_code: string;
  payment_token: string;
};

type UploadedReference = {
  storagePath: string;
  mimeType: string;
};

type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function logServiceOrderFailure(
  stage: string,
  serviceSlug: string,
  error: SupabaseErrorLike | null | undefined,
) {
  console.error("[service-order]", {
    stage,
    serviceSlug,
    code: error?.code ?? null,
    message: error?.message ?? "Unknown service-order failure",
    details: error?.details ?? null,
    hint: error?.hint ?? null,
  });
}

type ValidatedServiceVariant = {
  variantType: string | null;
  material: string;
  sleeveType: string;
  quantity: number;
  sizes: Array<{ size: string; quantity: number }>;
};

function variantCombinationKey(
  variantType: string | null,
  material: string,
  sleeveType: string,
) {
  return [variantType ?? "", material, sleeveType].join("\u0000");
}

function validateServiceVariants(
  variants: ServiceVariantInput[],
  serviceSlug: string,
) {
  if (variants.length < 1) throw new Error("VARIANT_REQUIRED");
  if (variants.length > maxServiceVariantCount) {
    throw new Error("VARIANT_TOO_MANY");
  }

  const combinations = new Set<string>();
  const validatedVariants: ValidatedServiceVariant[] = [];
  let totalQuantity = 0;

  for (const variant of variants) {
    let variantType: string | null = null;
    const serviceMaterials = getServiceVariantMaterials(serviceSlug);

    if (!serviceMaterials) throw new Error("VARIANT_NOT_ALLOWED");

    let allowedMaterials: readonly string[] = serviceMaterials;

    if (serviceSlug === "jersey") {
      if (variant.variantType === null) {
        throw new Error("VARIANT_TYPE_REQUIRED");
      }
      if (!isJerseyVariantType(variant.variantType)) {
        throw new Error("VARIANT_TYPE_INVALID");
      }
      const jerseyVariantType = variant.variantType;
      variantType = jerseyVariantType;
      allowedMaterials = getJerseyVariantMaterials(jerseyVariantType);
    } else if (variant.variantType !== null) {
      throw new Error("VARIANT_TYPE_NOT_ALLOWED");
    }

    if (
      !allowedMaterials.some((material) => material === variant.material)
    ) {
      throw new Error("VARIANT_MATERIAL_INVALID");
    }
    if (!isServiceVariantSleeveType(variant.sleeveType)) {
      throw new Error("VARIANT_SLEEVE_INVALID");
    }

    const combination = variantCombinationKey(
      variantType,
      variant.material,
      variant.sleeveType,
    );
    if (combinations.has(combination)) throw new Error("VARIANT_DUPLICATE");
    combinations.add(combination);

    const sizes = new Set<string>();
    const positiveSizes: ValidatedServiceVariant["sizes"] = [];

    for (const size of variant.sizes) {
      if (!isServiceVariantSize(size.size)) {
        throw new Error("VARIANT_SIZE_INVALID");
      }
      if (sizes.has(size.size)) throw new Error("VARIANT_SIZE_DUPLICATE");
      sizes.add(size.size);

      if (
        !Number.isSafeInteger(size.quantity) ||
        size.quantity < 0 ||
        size.quantity > maxServiceOrderQuantity
      ) {
        throw new Error("VARIANT_SIZE_INVALID");
      }
      if (size.quantity > 0) positiveSizes.push(size);
    }

    if (positiveSizes.length < 1) throw new Error("VARIANT_SIZE_REQUIRED");

    const quantity = positiveSizes.reduce(
      (sum, size) => sum + size.quantity,
      0,
    );
    totalQuantity += quantity;
    validatedVariants.push({
      variantType,
      material: variant.material,
      sleeveType: variant.sleeveType,
      quantity,
      sizes: positiveSizes,
    });
  }

  if (totalQuantity < 1 || totalQuantity > maxServiceOrderQuantity) {
    throw new Error("VARIANT_TOTAL_INVALID");
  }

  return { variants: validatedVariants, totalQuantity };
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isServiceFlow(value: string): value is PublicServiceFlow {
  return publicServiceFlows.some((flow) => flow === value);
}

async function removeUploadedReferences(
  storage: ReturnType<ReturnType<typeof createAdminClient>["storage"]["from"]>,
  references: UploadedReference[],
) {
  if (references.length === 0) return;
  await storage.remove(references.map(({ storagePath }) => storagePath));
}

async function uploadDesignReferences(
  orderId: string,
  references: ValidatedDesignReference[],
  supabase: ReturnType<typeof createAdminClient>,
  serviceSlug: string,
) {
  const storage = supabase.storage.from("design-references");
  const uploadedReferences: UploadedReference[] = [];

  for (const reference of references) {
    const storagePath = `orders/${orderId}/design/${crypto.randomUUID()}.${reference.extension}`;
    const { error } = await storage.upload(storagePath, reference.bytes, {
      contentType: reference.contentType,
      upsert: false,
    });

    if (error) {
      logServiceOrderFailure("design-reference-upload", serviceSlug, error);
      await removeUploadedReferences(storage, uploadedReferences);
      return false;
    }

    uploadedReferences.push({
      storagePath,
      mimeType: reference.contentType,
    });
  }

  const { error: registrationError } = await supabase
    .from("order_design_references")
    .insert(
      uploadedReferences.map(({ storagePath, mimeType }) => ({
        order_id: orderId,
        storage_path: storagePath,
        mime_type: mimeType,
      })),
    );

  if (registrationError) {
    logServiceOrderFailure(
      "design-reference-registration",
      serviceSlug,
      registrationError,
    );
    await removeUploadedReferences(storage, uploadedReferences);
    return false;
  }

  return true;
}

export async function createServiceOrder(
  input: ServiceOrderInput,
): Promise<{ paymentToken: string; referenceUploadFailed: boolean }> {
  if (!uuidPattern.test(input.serviceId)) {
    throw new Error("SERVICE_UNAVAILABLE");
  }

  const supabase = createAdminClient();
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id, slug, flow")
    .eq("id", input.serviceId)
    .eq("is_active", true)
    .maybeSingle<ActiveServiceForOrder>();

  if (serviceError) {
    logServiceOrderFailure("service-fetch", "unknown", serviceError);
    throw new Error("ORDER_CREATE_FAILED");
  }
  if (
    !service ||
    !isServiceFlow(service.flow) ||
    service.slug === "jersey-embos"
  ) {
    throw new Error("SERVICE_UNAVAILABLE");
  }

  const requirement = input.requirement.trim();
  const material = input.material.trim();
  const designDescription = input.designDescription.trim();
  const designOriented = isDesignOrientedService(service.slug);
  const otherService = isOtherService(service.slug);
  const referenceRequirement =
    getDesignReferenceRequirement(service.slug);
  const allowedVariantMaterials = getServiceVariantMaterials(service.slug);
  const variantService = allowedVariantMaterials !== null;

  const validatedVariantResult = allowedVariantMaterials
    ? validateServiceVariants(input.variants, service.slug)
    : null;

  if (!variantService && input.variants.length > 0) {
    throw new Error("VARIANT_NOT_ALLOWED");
  }
  if (
    !variantService &&
    !otherService &&
    (!Number.isSafeInteger(input.quantity) ||
      input.quantity === null ||
      input.quantity < 1 ||
      input.quantity > maxServiceOrderQuantity)
  ) {
    throw new Error("QUANTITY_INVALID");
  }

  const orderQuantity = otherService
    ? 1
    : validatedVariantResult?.totalQuantity ?? input.quantity;

  if (orderQuantity === null) throw new Error("QUANTITY_INVALID");

  if (designOriented) {
    if (!variantService && !material) throw new Error("MATERIAL_REQUIRED");
    if (designDescription.length < 10) {
      throw new Error("DESIGN_DESCRIPTION_REQUIRED");
    }
  } else if (!requirement) {
    throw new Error("REQUIREMENT_REQUIRED");
  }

  if (material.length > 2000) throw new Error("MATERIAL_TOO_LONG");
  if (designDescription.length > 2000) {
    throw new Error("DESIGN_DESCRIPTION_TOO_LONG");
  }
  if (
    referenceRequirement === "required" &&
    input.designReferences.length === 0
  ) {
    throw new Error("REFERENCE_REQUIRED");
  }
  if (
    referenceRequirement === "unsupported" &&
    input.designReferences.length > 0
  ) {
    throw new Error("REFERENCE_NOT_ALLOWED");
  }

  const validatedReferences =
    referenceRequirement === "unsupported"
      ? []
      : await validateDesignReferences(input.designReferences);

  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_kind: "service",
      service_id: service.id,
      customer_name: input.customerName,
      customer_whatsapp: input.customerWhatsapp,
      customer_company: input.customerCompany,
      customer_email: input.customerEmail,
      shipping_address: input.shippingAddress,
      quantity: orderQuantity,
      material:
        service.flow === "konveksi_sablon"
          ? variantService
            ? null
            : designOriented
              ? material
            : requirement
          : null,
      job_description: service.flow === "permak" ? requirement : null,
      design_description: designOriented ? designDescription : null,
    })
    .select("id, order_code, payment_token")
    .single<CreatedServiceOrder>();

  if (error || !data?.payment_token) {
    logServiceOrderFailure("parent-insert", service.slug, error);
    throw new Error("ORDER_CREATE_FAILED");
  }

  if (validatedVariantResult) {
    const { data: insertedVariants, error: variantError } = await supabase
      .from("order_service_variants")
      .insert(
        validatedVariantResult.variants.map((variant) => ({
          order_id: data.id,
          variant_type: variant.variantType,
          material: variant.material,
          sleeve_type: variant.sleeveType,
          quantity: variant.quantity,
        })),
      )
      .select("id, variant_type, material, sleeve_type")
      .returns<
        Array<{
          id: string;
          variant_type: string | null;
          material: string;
          sleeve_type: string;
        }>
      >();

    if (
      variantError ||
      !insertedVariants ||
      insertedVariants.length !== validatedVariantResult.variants.length
    ) {
      logServiceOrderFailure("variant-insert", service.slug, variantError);
      const { error: cleanupError } = await supabase
        .from("orders")
        .delete()
        .eq("id", data.id);
      if (cleanupError) {
        logServiceOrderFailure(
          "variant-insert-cleanup",
          service.slug,
          cleanupError,
        );
        throw new Error("ORDER_CLEANUP_FAILED");
      }
      throw new Error("ORDER_CREATE_FAILED");
    }

    const insertedVariantByCombination = new Map(
      insertedVariants.map((variant) => [
        variantCombinationKey(
          variant.variant_type,
          variant.material,
          variant.sleeve_type,
        ),
        variant.id,
      ]),
    );
    const missingVariantId = validatedVariantResult.variants.some(
      (variant) =>
        !insertedVariantByCombination.has(
          variantCombinationKey(
            variant.variantType,
            variant.material,
            variant.sleeveType,
          ),
        ),
    );

    if (missingVariantId) {
      logServiceOrderFailure("variant-id-mapping", service.slug, null);
      const { error: cleanupError } = await supabase
        .from("orders")
        .delete()
        .eq("id", data.id);
      if (cleanupError) {
        logServiceOrderFailure(
          "variant-id-mapping-cleanup",
          service.slug,
          cleanupError,
        );
        throw new Error("ORDER_CLEANUP_FAILED");
      }
      throw new Error("ORDER_CREATE_FAILED");
    }

    const sizeRows = validatedVariantResult.variants.flatMap((variant) => {
      const variantId = insertedVariantByCombination.get(
        variantCombinationKey(
          variant.variantType,
          variant.material,
          variant.sleeveType,
        ),
      );

      return variant.sizes.map((size) => ({
        variant_id: variantId as string,
        size: size.size,
        quantity: size.quantity,
      }));
    });

    const { error: sizeError } = await supabase
      .from("order_service_variant_sizes")
      .insert(sizeRows);

    if (sizeError) {
      logServiceOrderFailure("size-insert", service.slug, sizeError);
      const { error: cleanupError } = await supabase
        .from("orders")
        .delete()
        .eq("id", data.id);
      if (cleanupError) {
        logServiceOrderFailure(
          "size-insert-cleanup",
          service.slug,
          cleanupError,
        );
        throw new Error("ORDER_CLEANUP_FAILED");
      }
      throw new Error("ORDER_CREATE_FAILED");
    }
  }

  const referencesUploaded =
    validatedReferences.length === 0
      ? true
      : await uploadDesignReferences(
          data.id,
          validatedReferences,
          supabase,
          service.slug,
        );

  return {
    paymentToken: data.payment_token,
    referenceUploadFailed: !referencesUploaded,
  };
}
