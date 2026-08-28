import "server-only";

import {
  validateDesignReferences,
  type ValidatedDesignReference,
} from "@/lib/orders/design-reference";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  allowsDesignReference,
  isDesignOrientedService,
} from "@/lib/services/service-requirements";
import {
  publicServiceFlows,
  type PublicServiceFlow,
} from "@/lib/services/public-services";

export type ServiceOrderInput = {
  serviceId: string;
  customerName: string;
  customerWhatsapp: string;
  quantity: number;
  customerCompany: string | null;
  customerEmail: string | null;
  shippingAddress: string | null;
  requirement: string;
  material: string;
  designDescription: string;
  designReferences: File[];
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

  if (serviceError) throw new Error("ORDER_CREATE_FAILED");
  if (!service || !isServiceFlow(service.flow)) {
    throw new Error("SERVICE_UNAVAILABLE");
  }

  const requirement = input.requirement.trim();
  const material = input.material.trim();
  const designDescription = input.designDescription.trim();
  const designOriented = isDesignOrientedService(service.slug);
  const referenceAllowed = allowsDesignReference(service.slug);

  if (designOriented) {
    if (!material) throw new Error("MATERIAL_REQUIRED");
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
  if (input.designReferences.length > 0 && !referenceAllowed) {
    throw new Error("REFERENCE_NOT_ALLOWED");
  }

  const validatedReferences = referenceAllowed
    ? await validateDesignReferences(input.designReferences)
    : [];

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
      quantity: input.quantity,
      material:
        service.flow === "konveksi_sablon"
          ? designOriented
            ? material
            : requirement
          : null,
      job_description: service.flow === "permak" ? requirement : null,
      design_description: designOriented ? designDescription : null,
    })
    .select("id, order_code, payment_token")
    .single<CreatedServiceOrder>();

  if (error || !data?.payment_token) {
    throw new Error("ORDER_CREATE_FAILED");
  }

  const referencesUploaded =
    validatedReferences.length === 0
      ? true
      : await uploadDesignReferences(data.id, validatedReferences, supabase);

  return {
    paymentToken: data.payment_token,
    referenceUploadFailed: !referencesUploaded,
  };
}
