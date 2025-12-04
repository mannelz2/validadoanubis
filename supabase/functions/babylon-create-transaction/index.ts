import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.84.0";

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
      .eq("provider", "babylon")
      .eq("is_active", true)
      .maybeSingle();

    if (settingsError || !settings) {
      console.error("Babylon settings not found:", settingsError);
      return new Response(
        JSON.stringify({ error: "Babylon provider not configured" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!settings.secret_key || !settings.company_id) {
      console.error("Babylon credentials missing");
      return new Response(
        JSON.stringify({ error: "Babylon credentials not configured" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data: CreateTransactionRequest = await req.json();

    const cleanCpf = data.cpf.replace(/\D/g, "");
    const amountInCents = Math.round(data.amount * 100);
    const externalRef = `babylon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const auth = "Basic " + btoa(`${settings.secret_key}:${settings.company_id}`);

    const payload: any = {
      amount: amountInCents,
      paymentMethod: "pix",
      customer: {
        name: data.customerName || "Cliente",
        email: data.customerEmail || `${cleanCpf}@cliente.com`,
        phone: data.customerPhone || "11999999999",
        document: cleanCpf,
      },
      items: [
        {
          externalRef: `item_${Date.now()}`,
          title: data.productName || "Produto Digital",
          unitPrice: amountInCents,
          quantity: 1,
          tangible: false,
        },
      ],
      postbackUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/babylon-webhook`,
      metadata: JSON.stringify({
        utm_source: data.utmSource,
        utm_medium: data.utmMedium,
        utm_campaign: data.utmCampaign,
        utm_term: data.utmTerm,
        utm_content: data.utmContent,
        src: data.src,
        sck: data.sck,
        product_id: data.productId,
        user_agent: data.userAgent,
        external_ref: externalRef,
      }),
      ip: data.userIp || "127.0.0.1",
    };

    console.log("Creating Babylon transaction:", {
      url: `${settings.api_url}/transactions`,
      hasSecretKey: !!settings.secret_key,
      hasCompanyId: !!settings.company_id,
    });

    console.log("Babylon payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${settings.api_url}/transactions`, {
      method: "POST",
      headers: {
        "Authorization": auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("Babylon response status:", response.status);

    const responseText = await response.text();
    console.log("Babylon raw response:", responseText);

    if (!response.ok) {
      console.error("Babylon error response:", responseText);

      let error;
      try {
        error = JSON.parse(responseText);
      } catch {
        error = { message: responseText || "Failed to create Babylon transaction" };
      }

      return new Response(
        JSON.stringify({ 
          error: error.message || error.error || "Failed to create Babylon transaction",
          details: error,
          status: response.status
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const babylonResponse = JSON.parse(responseText);
    console.log("Babylon transaction created:", JSON.stringify(babylonResponse, null, 2));

    const transactionData = babylonResponse.data || babylonResponse;
    const pixData = transactionData.pix;

    const qrCodeText = pixData?.qrcode || pixData?.qrCode || pixData?.emv || "";
    const qrCodeImage = qrCodeText
      ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeText)}`
      : "";

    const { data: transaction, error: dbError } = await supabase
      .from("transactions")
      .insert({
        genesys_transaction_id: transactionData.id?.toString() || externalRef,
        provider: "babylon",
        cpf: cleanCpf,
        amount: data.amount,
        pix_key: data.pixKey,
        qr_code: qrCodeText,
        qr_code_image: qrCodeImage,
        status: "pending",
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
    console.error("Error creating Babylon transaction:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
