import { createClient } from '@supabase/supabase-js';
import type { CreateTransactionRequest, Transaction } from './genesysApi';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface BestfyConfig {
  apiUrl: string;
  secretKey: string;
  publicKey: string;
}

export async function createBestfyTransaction(
  config: BestfyConfig,
  data: CreateTransactionRequest
): Promise<Transaction> {
  try {
    console.log('Creating Bestfy transaction with amount:', data.amount);

    const auth = 'Basic ' + btoa(`${config.secretKey}:x`);

    const objectId = Date.now().toString();
    const amountInCents = Math.round(data.amount * 100);

    const payload: any = {
      amount: amountInCents,
      paymentMethod: 'pix',
      customer: {
        name: data.customerName || 'Cliente',
        email: data.customerEmail || 'cliente@example.com',
        phone: data.customerPhone || '11999999999',
        document: {
          type: 'cpf',
          number: data.cpf.replace(/\D/g, ''),
        },
      },
      items: [
        {
          externalRef: `item_${objectId}`,
          title: data.productName || 'Produto Digital',
          unitPrice: amountInCents,
          quantity: 1,
          tangible: false,
        },
      ],
      postbackUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bestfy-webhook`,
      metadata: JSON.stringify({
        utm_source: data.utmSource,
        utm_medium: data.utmMedium,
        utm_campaign: data.utmCampaign,
        utm_term: data.utmTerm,
        utm_content: data.utmContent,
        src: data.src,
      }),
      ip: '127.0.0.1',
    };

    console.log('Bestfy API URL:', `${config.apiUrl}/v1/transactions`);
    console.log('Bestfy payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${config.apiUrl}/v1/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Bestfy Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bestfy API error:', errorText);
      throw new Error(`Bestfy API error: ${response.status} - ${errorText}`);
    }

    const bestfyResponse = await response.json();
    console.log('Bestfy transaction created:', JSON.stringify(bestfyResponse, null, 2));

    const transactionData = bestfyResponse.data || bestfyResponse;
    const transactionId = crypto.randomUUID();

    const pixData = transactionData.pix;
    console.log('PIX Data:', JSON.stringify(pixData, null, 2));

    const qrCodeText = pixData?.qrcode || '';
    let qrCodeImage = pixData?.url || '';

    if (!qrCodeImage && qrCodeText) {
      qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeText)}`;
      console.log('Generated QR Code URL:', qrCodeImage);
    }

    console.log('QR Code Text:', qrCodeText);
    console.log('QR Code Image URL:', qrCodeImage);

    const transaction: Transaction = {
      id: transactionId,
      amount: data.amount,
      status: 'pending',
      qr_code: qrCodeText,
      qr_code_image: qrCodeImage,
      cpf: data.cpf,
      genesys_transaction_id: transactionData.id?.toString() || transactionId,
      provider: 'bestfy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      utm_source: data.utmSource,
      utm_medium: data.utmMedium,
      utm_campaign: data.utmCampaign,
      utm_term: data.utmTerm,
      utm_content: data.utmContent,
      src: data.src,
    };

    const { error } = await supabase.from('transactions').insert(transaction);

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('Transaction saved to database:', transactionId);

    if (data.createReceipt !== false) {
      await supabase
        .from('payment_receipts')
        .insert({
          transaction_id: transactionId,
          cpf: data.cpf,
          customer_name: data.customerName || 'Cliente',
          amount: data.amount,
          status: 'pending_receipt',
        })
        .select()
        .single();
    }

    return transaction;
  } catch (error: any) {
    console.error('Error creating Bestfy transaction:', error);
    throw error;
  }
}

export async function getBestfyTransactionStatus(
  config: BestfyConfig,
  transactionId: string
): Promise<string> {
  try {
    console.log('Checking Bestfy transaction status:', transactionId);

    const auth = 'Basic ' + btoa(`${config.secretKey}:x`);

    const response = await fetch(`${config.apiUrl}/v1/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bestfy status check error:', errorText);
      throw new Error(`Bestfy API error: ${response.status} - ${errorText}`);
    }

    const bestfyResponse = await response.json();
    console.log('Bestfy transaction status:', bestfyResponse);

    const transactionData = bestfyResponse.data || bestfyResponse;
    const status = transactionData.status || 'pending';

    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'waiting_payment': 'pending',
      'paid': 'approved',
      'authorized': 'approved',
      'approved': 'approved',
      'cancelled': 'cancelled',
      'canceled': 'cancelled',
      'failed': 'failed',
      'refunded': 'cancelled',
      'expired': 'cancelled',
    };

    return statusMap[status.toLowerCase()] || 'pending';
  } catch (error: any) {
    console.error('Error checking Bestfy transaction status:', error);
    throw error;
  }
}
