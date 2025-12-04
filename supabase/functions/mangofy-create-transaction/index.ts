import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CreateTransactionRequest {
  cpf: string;
  amount: number;
  pixKey: string;
  productName?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  externalCode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  src?: string;
  sck?: string;
  productId?: string;
  userAgent?: string;
  userIp?: string;
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

    const { data: settings, error: settingsError } = await supabase
      .from("pix_provider_settings")
      .select("*")
      .eq("provider", "mangofy")
      .eq("is_active", true)
      .maybeSingle();

    if (settingsError || !settings) {
      console.error("Mangofy settings not found:", settingsError);
      return new Response(
        JSON.stringify({ error: "Mangofy provider not configured" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data: CreateTransactionRequest = await req.json();

    const cleanCpf = data.cpf.replace(/\D/g, "");
    const externalCode = data.externalCode || `TXN-${Date.now()}`;
    const amountInCents = Math.round(data.amount * 100);

    const payload = {
      store_code: settings.store_code,
      external_code: externalCode,
      payment_method: "pix",
      payment_format: "regular",
      installments: 1,
      payment_amount: amountInCents,
      shipping_amount: 0,
      postback_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mangofy-webhook`,
      items: [
        {
          name: data.productName || "Produto Digital",
          quantity: 1,
          unit_price: amountInCents,
        },
      ],
      customer: {
        email: data.customerEmail || `${cleanCpf}@cliente.com`,
        name: data.customerName || "Cliente",
        document: cleanCpf,
        phone: data.customerPhone || "11999999999",
        ip: "216.198.79.131",
      },
      pix: {
        expiration_time: 1800,
      },
    };

    console.log("Creating Mangofy transaction:", {
      url: `${settings.api_url}/api/v1/payment`,
      storeCode: settings.store_code,
      hasApiKey: !!settings.api_key,
      apiKeyLength: settings.api_key?.length,
    });

    console.log("Mangofy payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${settings.api_url}/api/v1/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": settings.api_key,
        "Store-Code": settings.store_code,
      },
      body: JSON.stringify(payload),
    });

    console.log("Mangofy response status:", response.status);

    const responseText = await response.text();
    console.log("Mangofy raw response:", responseText);

    if (!response.ok) {
      console.error("Mangofy error response:", responseText);

      let error;
      try {
        error = JSON.parse(responseText);
      } catch {
        error = { message: responseText || "Failed to create Mangofy transaction" };
      }

      return new Response(
        JSON.stringify({ 
          error: error.message || error.error || "Failed to create Mangofy transaction",
          details: error,
          status: response.status
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const mangofyTransaction = JSON.parse(responseText);
    console.log("Mangofy transaction created:", mangofyTransaction);

    const pixPayload = mangofyTransaction.pix?.qr_code || "";
    const qrCodeImageUrl =
      mangofyTransaction.pix?.qr_code_image ||
      (pixPayload
        ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(pixPayload)}`
        : "");

    const { data: transaction, error: dbError } = await supabase
      .from("transactions")
      .insert({
        external_transaction_id: mangofyTransaction.payment_code,
        provider: "mangofy",
        cpf: cleanCpf,
        amount: data.amount,
        pix_key: data.pixKey,
        qr_code: pixPayload,
        qr_code_image: qrCodeImageUrl,
        status: mangofyTransaction.status.toLowerCase() === "pending" ? "pending" : "completed",
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        utm_source: data.utmSource,
        utm_medium: data.utmMedium,
        utm_campaign: data.utmCampaign,
        utm_term: data.utmTerm,
        utm_content: data.utmContent,
        src: data.src,
        sck: data.sck,
        product_id: data.productId,
        user_agent: data.userAgent,
        user_ip: data.userIp,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Database error", details: dbError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Transaction saved to database:", transaction.id);

    return new Response(JSON.stringify(transaction), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error creating Mangofy transaction:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
