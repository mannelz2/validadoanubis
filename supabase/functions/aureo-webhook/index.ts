import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AureoWebhookPayload {
  id?: number;
  order_id?: string;
  objectId?: string;
  type?: string;
  status?: string;
  amount?: number;
  value?: number;
  paymentMethod?: string;
  paidAt?: string;
  customer?: {
    name?: string;
    email?: string;
    document?: {
      type?: string;
      number?: string;
    };
  };
  metadata?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_id?: string;
    utm_term?: string;
    utm_content?: string;
    fbclid?: string;
    gclid?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface UtmifyPayload {
  order_id: string;
  status: string;
  amount: number;
  customer: {
    name: string;
    email: string;
  };
  metadata: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_id?: string;
    utm_term?: string;
    utm_content?: string;
    fbclid?: string;
    gclid?: string;
  };
}

async function sendToUtmify(payload: UtmifyPayload): Promise<{ success: boolean; response?: any; error?: string }> {
  try {
    console.log("Sending to UTMify:", JSON.stringify(payload, null, 2));

    const response = await fetch("https://api.utmify.com.br/api-credentials/orders", {
      method: "POST",
      headers: {
        "Authorization": "Bearer bfBXU9FETyuvS1HFF4sTxgSzAK3DwscUYmUo",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json().catch(() => ({}));

    console.log("UTMify response status:", response.status);
    console.log("UTMify response data:", JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      return {
        success: false,
        error: `UTMify returned ${response.status}`,
        response: responseData,
      };
    }

    return {
      success: true,
      response: responseData,
    };
  } catch (error: any) {
    console.error("Error sending to UTMify:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
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

    const payload: AureoWebhookPayload = await req.json();

    console.log("Aureo webhook received:", JSON.stringify(payload, null, 2));

    const transactionId = payload.id?.toString() || payload.order_id || payload.objectId;
    const rawStatus = payload.status?.toLowerCase() || "pending";

    const statusMap: Record<string, string> = {
      "pending": "pending",
      "waiting_payment": "pending",
      "paid": "approved",
      "authorized": "approved",
      "approved": "approved",
      "cancelled": "cancelled",
      "canceled": "cancelled",
      "failed": "failed",
      "expired": "cancelled",
      "refunded": "refunded",
    };

    const status = statusMap[rawStatus] || rawStatus;

    const { data: transaction, error: findError } = await supabase
      .from("transactions")
      .select("*")
      .eq("genesys_transaction_id", transactionId)
      .maybeSingle();

    if (findError) {
      console.error("Database error finding transaction:", findError);
      return new Response(
        JSON.stringify({
          status: "success",
          message: "Database error",
          details: findError.message,
          utmify_status: "skipped"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!transaction) {
      console.warn("Transaction not found for id:", transactionId);
      return new Response(
        JSON.stringify({
          status: "success",
          message: "Transaction not found",
          transaction_id: transactionId,
          utmify_status: "skipped"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Transaction found:", {
      id: transaction.id,
      cpf: transaction.cpf,
      status: transaction.status,
      utm_source: transaction.utm_source,
      utm_campaign: transaction.utm_campaign,
    });

    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString(),
    };

    if ((status === "approved" || status === "authorized") && !transaction.completed_at) {
      updateData.completed_at = payload.paidAt || new Date().toISOString();
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
        JSON.stringify({
          status: "success",
          error: "Update failed",
          details: updateError.message,
          utmify_status: "skipped"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Transaction updated successfully:", updatedTransaction.id);

    let utmifyStatus = "skipped";
    let utmifyResponse = null;
    let utmifyError = null;

    const utmifyStatusMap: Record<string, string> = {
      "pending": "pending",
      "approved": "paid",
      "cancelled": "canceled",
      "canceled": "canceled",
      "failed": "canceled",
      "refunded": "refunded",
      "expired": "expired",
    };

    const utmifyPayloadData: UtmifyPayload = {
      order_id: transactionId || transaction.id,
      status: utmifyStatusMap[status] || rawStatus,
      amount: payload.amount || payload.value || transaction.amount || 0,
      customer: {
        name: payload.customer?.name || "Cliente",
        email: payload.customer?.email || "contato@example.com",
      },
      metadata: {
        utm_source: payload.metadata?.utm_source || transaction.utm_source,
        utm_medium: payload.metadata?.utm_medium || transaction.utm_medium,
        utm_campaign: payload.metadata?.utm_campaign || transaction.utm_campaign,
        utm_id: payload.metadata?.utm_id,
        utm_term: payload.metadata?.utm_term || transaction.utm_term,
        utm_content: payload.metadata?.utm_content || transaction.utm_content,
        fbclid: payload.metadata?.fbclid,
        gclid: payload.metadata?.gclid,
      },
    };

    const cleanMetadata = Object.fromEntries(
      Object.entries(utmifyPayloadData.metadata).filter(([_, v]) => v != null)
    );
    utmifyPayloadData.metadata = cleanMetadata;

    console.log("Prepared UTMify payload:", JSON.stringify(utmifyPayloadData, null, 2));

    const utmifyResult = await sendToUtmify(utmifyPayloadData);

    const utmifyUpdateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (utmifyResult.success) {
      utmifyStatus = "sent";
      utmifyResponse = utmifyResult.response;
      utmifyUpdateData.utmify_sent = true;
      utmifyUpdateData.utmify_sent_at = new Date().toISOString();
      utmifyUpdateData.utmify_response = utmifyResult.response;
      utmifyUpdateData.utmify_error = null;
      console.log("Successfully sent to UTMify");
    } else {
      utmifyStatus = "error";
      utmifyError = utmifyResult.error;
      utmifyUpdateData.utmify_sent = false;
      utmifyUpdateData.utmify_error = utmifyResult.error;
      if (utmifyResult.response) {
        utmifyUpdateData.utmify_response = utmifyResult.response;
      }
      console.error("Failed to send to UTMify:", utmifyResult.error);
    }

    const { error: utmifyUpdateError } = await supabase
      .from("transactions")
      .update(utmifyUpdateData)
      .eq("id", transaction.id);

    if (utmifyUpdateError) {
      console.error("Error updating UTMify status:", utmifyUpdateError);
    }

    return new Response(
      JSON.stringify({
        status: "success",
        transaction_id: updatedTransaction.id,
        transaction_status: updatedTransaction.status,
        utmify_status: utmifyStatus,
        utmify_response: utmifyResponse,
        utmify_error: utmifyError,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({
        status: "success",
        error: "Internal server error",
        message: error.message,
        utmify_status: "error"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});