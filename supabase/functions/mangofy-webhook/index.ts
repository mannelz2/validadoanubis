import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface MangofyWebhookPayload {
  payment_code: string;
  status: string;
  payment_method?: string;
  payment_amount?: number;
  paid_at?: string;
  customer?: {
    document?: string;
    email?: string;
    name?: string;
  };
  [key: string]: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload: MangofyWebhookPayload = await req.json();

    console.log("Mangofy webhook received:", JSON.stringify(payload, null, 2));

    const paymentCode = payload.payment_code;
    let status = payload.status?.toLowerCase() || "pending";

    if (status === "approved" || status === "paid") {
      status = "completed";
    } else if (status === "refunded" || status === "error") {
      status = "failed";
    }

    const { data: transaction, error: findError } = await supabase
      .from("transactions")
      .select("*")
      .eq("external_transaction_id", paymentCode)
      .eq("provider", "mangofy")
      .maybeSingle();

    if (findError) {
      console.error("Database error finding transaction:", findError);
      return new Response(
        JSON.stringify({ error: "Database error", details: findError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!transaction) {
      console.warn("Transaction not found for payment_code:", paymentCode);
      return new Response(
        JSON.stringify({ message: "Transaction not found", payment_code: paymentCode }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString(),
    };

    if (status === "completed" && !transaction.completed_at) {
      updateData.completed_at = payload.paid_at || new Date().toISOString();
    }

    if (!transaction.webhook_payload) {
      updateData.webhook_payload = [payload];
    } else {
      const existingPayloads = Array.isArray(transaction.webhook_payload)
        ? transaction.webhook_payload
        : [transaction.webhook_payload];
      updateData.webhook_payload = [...existingPayloads, payload];
    }

    const { data: updatedTransaction, error: updateError } = await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", transaction.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating transaction:", updateError);
      return new Response(
        JSON.stringify({ error: "Update failed", details: updateError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Transaction updated successfully:", updatedTransaction.id);

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: updatedTransaction.id,
        status: updatedTransaction.status,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});