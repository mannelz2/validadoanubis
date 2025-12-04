import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface MangofyConfig {
  apiUrl: string;
  apiKey: string;
  storeCode: string;
}

export interface CreateMangofyTransactionRequest {
  cpf: string;
  amount: number;
  pixKey: string;
  productName?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  externalCode?: string;
  createReceipt?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  src?: string;
}

export interface MangofyTransaction {
  payment_code: string;
  status: string;
  pix?: {
    qr_code: string;
    qr_code_image?: string;
  };
}

export interface Transaction {
  id: string;
  genesys_transaction_id: string;
  cpf: string;
  amount: number;
  pix_key: string;
  qr_code: string;
  qr_code_image: string;
  status: string;
  expires_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export async function createMangofyTransaction(
  config: MangofyConfig,
  data: CreateMangofyTransactionRequest
): Promise<Transaction> {
  try {
    console.log('Creating Mangofy transaction via Edge Function');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mangofy-create-transaction`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          cpf: data.cpf,
          amount: data.amount,
          pixKey: data.pixKey,
          productName: data.productName,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          externalCode: data.externalCode,
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
          utmTerm: data.utmTerm,
          utmContent: data.utmContent,
          src: data.src,
        }),
      }
    );

    console.log('Edge Function response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge Function error response:', errorText);

      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || 'Failed to create Mangofy transaction' };
      }
      throw new Error(error.error || error.message || 'Failed to create Mangofy transaction');
    }

    const transaction = await response.json();

    console.log('Transaction created:', transaction);

    if (data.createReceipt !== false) {
      await supabase
        .from('payment_receipts')
        .insert({
          transaction_id: transaction.id,
          cpf: data.cpf.replace(/\D/g, ''),
          customer_name: data.customerName || 'Cliente',
          amount: data.amount,
          status: 'pending_receipt',
        })
        .select()
        .single();
    }

    return transaction as Transaction;
  } catch (error) {
    console.error('Error creating Mangofy transaction:', error);
    throw error;
  }
}

export async function getMangofyTransactionStatus(
  config: MangofyConfig,
  paymentCode: string
): Promise<string> {
  try {
    const response = await fetch(
      `${config.apiUrl}/api/v1/payment/${paymentCode}`,
      {
        headers: {
          'Authorization': config.apiKey,
          'Store-Code': config.storeCode,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch transaction status from Mangofy');
    }

    const mangofyTransaction: MangofyTransaction = await response.json();
    return mangofyTransaction.status.toLowerCase();
  } catch (error) {
    console.error('Error getting Mangofy transaction status:', error);
    throw error;
  }
}
