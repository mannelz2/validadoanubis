import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function formatDateToUTC(date: Date | string): string {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const seconds = String(d.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function cleanCpf(cpf: string | null): string | null {
  if (!cpf) return null;
  return cpf.replace(/[^\d]/g, '');
}

interface UtmifyPayload {
  orderId: string;
  platform: string;
  paymentMethod: 'credit_card' | 'boleto' | 'pix' | 'paypal' | 'free_price';
  status: 'waiting_payment' | 'paid' | 'refused' | 'refunded' | 'chargedback';
  createdAt: string;
  approvedDate: string | null;
  refundedAt: string | null;
  customer: {
    name: string;
    email: string;
    phone: string | null;
    document: string | null;
    country?: string;
    ip?: string;
  };
  products: Array<{
    id: string;
    name: string;
    planId: string | null;
    planName: string | null;
    quantity: number;
    priceInCents: number;
  }>;
  trackingParameters: {
    src: string | null;
    sck: string | null;
    utm_source: string | null;
    utm_campaign: string | null;
    utm_medium: string | null;
    utm_content: string | null;
    utm_term: string | null;
  };
  commission: {
    totalPriceInCents: number;
    gatewayFeeInCents: number;
    userCommissionInCents: number;
    currency?: 'BRL' | 'USD' | 'EUR' | 'GBP' | 'ARS' | 'CAD';
  };
  isTest?: boolean;
}

async function sendToUtmify(payload: UtmifyPayload): Promise<{ success: boolean; response?: any; error?: string }> {
  try {
    console.log("=== UTMify Request Start ===");
    console.log("Endpoint: https://api.utmify.com.br/api-credentials/orders");
    console.log("Method: POST");
    console.log("Headers:", {
      "x-api-token": "bfBXU9FETyuvS1HFF4sTxgSzAK3DwscUYmUo",
      "Content-Type": "application/json",
    });
    console.log("Payload:", JSON.stringify(payload, null, 2));
    console.log("Payload size:", JSON.stringify(payload).length, "bytes");
    console.log("=== UTMify Request End ===");

    const response = await fetch("https://api.utmify.com.br/api-credentials/orders", {
      method: "POST",
      headers: {
        "x-api-token": "bfBXU9FETyuvS1HFF4sTxgSzAK3DwscUYmUo",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("=== UTMify Response Start ===");
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log("Response body (raw):", responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log("Response body (parsed):", JSON.stringify(responseData, null, 2));
    } catch (e) {
      console.log("Failed to parse response as JSON");
      responseData = { raw: responseText };
    }
    console.log("=== UTMify Response End ===");

    if (!response.ok) {
      return {
        success: false,
        error: `UTMify returned ${response.status}: ${response.statusText}`,
        response: responseData,
      };
    }

    return {
      success: true,
      response: responseData,
    };
  } catch (error: any) {
    console.error("=== UTMify Error ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("===================");
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

    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status") || "pending,approved";
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const dryRun = url.searchParams.get("dry_run") === "true";
    const retryFailed = url.searchParams.get("retry_failed") === "true";

    console.log("Sync parameters:", {
      statusFilter,
      limit,
      offset,
      dryRun,
      retryFailed,
    });

    const statuses = statusFilter.split(",").map(s => s.trim());

    let query = supabase
      .from("transactions")
      .select("*")
      .in("status", statuses)
      .not("utm_campaign", "is", null)
      .neq("utm_campaign", "")
      .neq("utm_campaign", "No Campaign")
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (retryFailed) {
      query = query.or("utmify_sent.is.null,utmify_sent.eq.false,utmify_error.not.is.null,utmify_last_status_synced.neq.status");
    } else {
      query = query.or("utmify_sent.is.null,utmify_sent.eq.false,utmify_last_status_synced.neq.status");
    }

    const { data: transactions, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching transactions:", fetchError);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch transactions",
          details: fetchError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!transactions || transactions.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No transactions to sync",
          count: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Found ${transactions.length} transactions to sync`);

    const results = {
      total: transactions.length,
      success: 0,
      failed: 0,
      skipped: 0,
      dry_run: dryRun,
      details: [] as any[],
    };

    const statusMap: Record<string, 'waiting_payment' | 'paid' | 'refused' | 'refunded' | 'chargedback'> = {
      "pending": "waiting_payment",
      "approved": "paid",
      "cancelled": "refused",
      "failed": "refused",
      "refunded": "refunded",
      "expired": "refused",
    };

    for (const transaction of transactions) {
      console.log(`\n=== Processing Transaction ${transaction.id} ===`);
      console.log("Transaction data:", {
        id: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        cpf: transaction.cpf ? `${transaction.cpf.substring(0, 3)}***` : null,
        created_at: transaction.created_at,
        completed_at: transaction.completed_at,
        utm_source: transaction.utm_source,
        utm_campaign: transaction.utm_campaign,
        utm_medium: transaction.utm_medium,
        src: transaction.src,
        sck: transaction.sck,
      });

      const hasValidCampaign = transaction.utm_campaign &&
                              transaction.utm_campaign !== '' &&
                              transaction.utm_campaign !== 'No Campaign';

      if (!hasValidCampaign) {
        console.log(`Skipping transaction ${transaction.id} - no valid campaign`);
        results.skipped++;
        results.details.push({
          transaction_id: transaction.id,
          status: "skipped",
          reason: "No valid campaign",
        });
        continue;
      }

      const utmifyStatus = statusMap[transaction.status] || "waiting_payment";
      console.log(`Mapped status: ${transaction.status} -> ${utmifyStatus}`);

      const cleanedCpf = cleanCpf(transaction.cpf);
      console.log("CPF cleaning:", {
        original: transaction.cpf,
        cleaned: cleanedCpf ? `${cleanedCpf.substring(0, 3)}***` : null,
      });

      const customerName = cleanedCpf ? `Cliente CPF ${cleanedCpf.substring(0, 3)}***` : "Cliente";
      const customerEmail = cleanedCpf ? `${cleanedCpf.substring(0, 3)}@cliente.com` : "contato@cliente.com";
      const productName = transaction.product_id || "Servi\u00e7o Digital";

      const amountInCents = Math.round((transaction.amount || 0) * 100);
      const gatewayFeeInCents = Math.round(amountInCents * 0.0399);
      const userCommissionInCents = amountInCents - gatewayFeeInCents;

      console.log("Amount calculations:", {
        amount: transaction.amount,
        amountInCents,
        gatewayFeeInCents,
        userCommissionInCents,
      });

      const createdAt = formatDateToUTC(transaction.created_at);
      const approvedDate = transaction.completed_at ? formatDateToUTC(transaction.completed_at) : null;

      console.log("Date formatting:", {
        created_at_raw: transaction.created_at,
        created_at_formatted: createdAt,
        completed_at_raw: transaction.completed_at,
        approved_date_formatted: approvedDate,
      });

      const utmifyPayload: UtmifyPayload = {
        orderId: transaction.genesys_transaction_id || transaction.id,
        platform: "NubankFunnel",
        paymentMethod: "pix",
        status: utmifyStatus,
        createdAt: createdAt,
        approvedDate: approvedDate,
        refundedAt: null,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: null,
          document: cleanedCpf,
          country: "BR",
          ip: transaction.user_ip || "0.0.0.0",
        },
        products: [
          {
            id: transaction.product_id || "serv-001",
            name: productName,
            planId: null,
            planName: null,
            quantity: 1,
            priceInCents: amountInCents,
          },
        ],
        trackingParameters: {
          src: transaction.src || null,
          sck: transaction.sck || null,
          utm_source: transaction.utm_source || null,
          utm_campaign: transaction.utm_campaign || null,
          utm_medium: transaction.utm_medium || null,
          utm_content: transaction.utm_content || null,
          utm_term: transaction.utm_term || null,
        },
        commission: {
          totalPriceInCents: amountInCents,
          gatewayFeeInCents: gatewayFeeInCents,
          userCommissionInCents: userCommissionInCents,
          currency: "BRL",
        },
        isTest: false,
      };

      console.log("Built UTMify payload structure:");
      console.log("- orderId:", utmifyPayload.orderId);
      console.log("- platform:", utmifyPayload.platform);
      console.log("- paymentMethod:", utmifyPayload.paymentMethod);
      console.log("- status:", utmifyPayload.status);
      console.log("- createdAt:", utmifyPayload.createdAt);
      console.log("- approvedDate:", utmifyPayload.approvedDate);
      console.log("- customer.name:", utmifyPayload.customer.name);
      console.log("- customer.email:", utmifyPayload.customer.email);
      console.log("- customer.document:", utmifyPayload.customer.document);
      console.log("- customer.country:", utmifyPayload.customer.country);
      console.log("- products.length:", utmifyPayload.products.length);
      console.log("- products[0].id:", utmifyPayload.products[0].id);
      console.log("- products[0].name:", utmifyPayload.products[0].name);
      console.log("- products[0].priceInCents:", utmifyPayload.products[0].priceInCents);
      console.log("- commission.totalPriceInCents:", utmifyPayload.commission.totalPriceInCents);
      console.log("- commission.gatewayFeeInCents:", utmifyPayload.commission.gatewayFeeInCents);
      console.log("- commission.userCommissionInCents:", utmifyPayload.commission.userCommissionInCents);
      console.log("- commission.currency:", utmifyPayload.commission.currency);
      console.log("- isTest:", utmifyPayload.isTest);

      if (!utmifyPayload.orderId) {
        console.error("ERROR: orderId is required but missing!");
        results.failed++;
        results.details.push({
          transaction_id: transaction.id,
          status: "failed",
          error: "Missing orderId",
        });
        continue;
      }

      if (dryRun) {
        console.log(`[DRY RUN] Would send transaction ${transaction.id}:`, utmifyPayload);
        results.success++;
        results.details.push({
          transaction_id: transaction.id,
          status: "dry_run",
          payload: utmifyPayload,
        });
        continue;
      }

      console.log(`\nSending transaction ${transaction.id} to UTMify...`);
      const utmifyResult = await sendToUtmify(utmifyPayload);

      console.log(`\nUTMify result for transaction ${transaction.id}:`, {
        success: utmifyResult.success,
        error: utmifyResult.error,
        response: utmifyResult.response,
      });

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (utmifyResult.success) {
        updateData.utmify_sent = true;
        updateData.utmify_sent_at = new Date().toISOString();
        updateData.utmify_last_status_synced = transaction.status;
        updateData.utmify_response = utmifyResult.response;
        updateData.utmify_error = null;
        results.success++;

        console.log(`✓ Successfully sent transaction ${transaction.id} to UTMify with status: ${transaction.status}`);
        results.details.push({
          transaction_id: transaction.id,
          status: "success",
          transaction_status: transaction.status,
          utmify_response: utmifyResult.response,
        });
      } else {
        updateData.utmify_sent = false;
        updateData.utmify_error = utmifyResult.error;
        if (utmifyResult.response) {
          updateData.utmify_response = utmifyResult.response;
        }
        results.failed++;

        console.error(`✗ Failed to send transaction ${transaction.id} to UTMify`);
        console.error("Error:", utmifyResult.error);
        console.error("Response:", JSON.stringify(utmifyResult.response, null, 2));
        results.details.push({
          transaction_id: transaction.id,
          status: "failed",
          error: utmifyResult.error,
          utmify_response: utmifyResult.response,
        });
      }

      const { error: updateError } = await supabase
        .from("transactions")
        .update(updateData)
        .eq("id", transaction.id);

      if (updateError) {
        console.error(`Error updating transaction ${transaction.id}:`, updateError);
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return new Response(
      JSON.stringify(results),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
