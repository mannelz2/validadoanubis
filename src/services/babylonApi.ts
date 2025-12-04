import { createClient } from '@supabase/supabase-js';
import type { CreateTransactionRequest, Transaction } from './genesysApi';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface BabylonConfig {
  apiUrl: string;
  secretKey: string;
  companyId: string;
}

export async function createBabylonTransaction(
  config: BabylonConfig,
  data: CreateTransactionRequest
): Promise<Transaction> {
  try {
    console.log('Creating Babylon transaction with amount:', data.amount);

    const payload = {
      cpf: data.cpf,
      amount: data.amount,
      pixKey: data.pixKey || '',
      productName: data.productName,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      utmTerm: data.utmTerm,
      utmContent: data.utmContent,
      src: data.src,
    };

    const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/babylon-create-transaction`;

    console.log('Calling Babylon Edge Function:', edgeFunctionUrl);

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    console.log('Edge Function Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Edge Function error:', errorData);
      throw new Error(errorData.error || 'Failed to create Babylon transaction');
    }

    const transaction = await response.json();
    console.log('Transaction created via Edge Function:', transaction);

    if (data.createReceipt !== false) {
      await supabase
        .from('payment_receipts')
        .insert({
          transaction_id: transaction.id,
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
    console.error('Error creating Babylon transaction:', error);
    throw error;
  }
}

export async function getBabylonTransactionStatus(
  config: BabylonConfig,
  transactionId: string
): Promise<string> {
  try {
    console.log('Checking Babylon transaction status:', transactionId);

    const auth = 'Basic ' + btoa(`${config.secretKey}:${config.companyId}`);

    const response = await fetch(`${config.apiUrl}/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Babylon status check error:', errorText);
      throw new Error(`Babylon API error: ${response.status} - ${errorText}`);
    }

    const babylonResponse = await response.json();
    console.log('Babylon transaction status:', babylonResponse);

    const transactionData = babylonResponse.data || babylonResponse;
    const status = transactionData.status || 'pending';

    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'waiting_payment': 'pending',
      'paid': 'approved',
      'authorized': 'approved',
      'approved': 'approved',
      'refused': 'failed',
      'canceled': 'cancelled',
      'cancelled': 'cancelled',
      'refunded': 'cancelled',
      'chargeback': 'cancelled',
      'failed': 'failed',
      'expired': 'cancelled',
      'in_analysis': 'pending',
      'in_protest': 'pending',
    };

    return statusMap[status.toLowerCase()] || 'pending';
  } catch (error: any) {
    console.error('Error checking Babylon transaction status:', error);
    throw error;
  }
}
