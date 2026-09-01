"use server";

import {
  getPublicTrackingOrder,
  type TrackingOrder,
} from "@/lib/orders/public-order-tracking";

export type TrackingActionState =
  | { status: "idle"; order: null }
  | { status: "invalid_input" | "not_found" | "unavailable"; order: null }
  | { status: "success"; order: TrackingOrder };

export async function lookupTrackingOrder(
  _previousState: TrackingActionState,
  formData: FormData,
): Promise<TrackingActionState> {
  const submittedCode = formData.get("orderCode");

  if (typeof submittedCode !== "string") {
    return { status: "invalid_input", order: null };
  }

  try {
    const result = await getPublicTrackingOrder(submittedCode);

    if (!result.ok) {
      return { status: result.reason, order: null };
    }

    return { status: "success", order: result.order };
  } catch (error) {
    console.error("[tracking] Public tracking action failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return { status: "unavailable", order: null };
  }
}
