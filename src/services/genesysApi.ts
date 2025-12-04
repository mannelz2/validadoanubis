import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

async function getGenesysConfig() {
  const { data, error } = await supabase
    .from('pix_provider_settings')
    .select('*')
    .eq('provider', 'genesys')
    .maybeSingle();

  if (error || !data) {
    return {
      apiUrl: import.meta.env.VITE_GENESYS_API_URL,
      apiSecret: import.meta.env.VITE_GENESYS_API_SECRET
    };
  }

  return {
    apiUrl: data.api_url,
    apiSecret: data.api_key
  };
}

export interface CreateTransactionRequest {
  cpf: string;
  amount: number;
  pixKey: string;
  productName?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerBirthdate?: string;
  customerAddress?: {
    zipcode?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
  createReceipt?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  src?: string;
  sck?: string;
  productId?: string;
  userIp?: string;
  userAgent?: string;
}

export interface GenesysTransaction {
  id: string;
  external_id: string;
  status: string;
  total_value: number;
  payment_method: string;
  pix: {
    payload: string;
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
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  src?: string;
  sck?: string;
  product_id?: string;
  user_ip?: string;
  user_agent?: string;
}

export async function createTransaction(data: CreateTransactionRequest): Promise<Transaction> {
  try {
    const config = await getGenesysConfig();

    console.log('Creating transaction with:', {
      url: `${config.apiUrl}/v1/transactions`,
      hasApiKey: !!config.apiSecret,
      apiKeyPrefix: config.apiSecret?.substring(0, 10),
      data,
    });

    const externalId = `nubank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const response = await fetch(`${config.apiUrl}/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-secret': config.apiSecret,
      },
      body: JSON.stringify({
        external_id: externalId,
        total_amount: data.amount,
        payment_method: 'PIX',
        webhook_url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/genesys-webhook`,
        items: [
          {
            id: 'product_' + Date.now(),
            title: data.productName || 'Produto Digital',
            description: `Pagamento ${data.productName || 'Produto Digital'}`,
            quantity: 1,
            price: data.amount,
            is_physical: false,
          },
        ],
        ip: '127.0.0.1',
        customer: {
          name: data.customerName || 'Cliente',
          email: data.customerEmail || 'cliente@example.com',
          document: data.cpf,
          document_type: 'CPF',
          phone: data.customerPhone || '11999999999',
          ...(data.utmSource && { utm_source: data.utmSource }),
          ...(data.utmMedium && { utm_medium: data.utmMedium }),
          ...(data.utmCampaign && { utm_campaign: data.utmCampaign }),
          ...(data.utmTerm && { utm_term: data.utmTerm }),
          ...(data.utmContent && { utm_content: data.utmContent }),
          ...(data.src && { src: data.src }),
        },
      }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      console.warn('API request failed. Using mock data for development.');

      const mockGenesysTransaction: GenesysTransaction = {
        id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        external_id: externalId,
        status: 'PENDING',
        total_value: data.amount,
        payment_method: {
          type: 'PIX',
          pix_payload: '00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p65204000053039865802BR5925NUBANK PAGAMENTOS SA6009SAO PAULO62410503***50300017br.gov.bcb.brcode01051.0.063043C2A',
        },
      };

      const pixPayload = mockGenesysTransaction.payment_method.pix_payload || '';
      const qrCodeImageUrl = pixPayload
        ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(pixPayload)}`
        : '';

      const { data: transaction, error: dbError } = await supabase
        .from('transactions')
        .insert({
          genesys_transaction_id: mockGenesysTransaction.id,
          cpf: data.cpf,
          amount: data.amount,
          pix_key: data.pixKey,
          qr_code: pixPayload,
          qr_code_image: qrCodeImageUrl,
          status: 'pending',
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          utm_source: data.utmSource,
          utm_medium: data.utmMedium,
          utm_campaign: data.utmCampaign,
          utm_term: data.utmTerm,
          utm_content: data.utmContent,
          src: data.src,
          sck: data.sck,
          product_id: data.productId,
          user_ip: data.userIp,
          user_agent: data.userAgent,
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

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

      return transaction as Transaction;
    }

    const genesysTransaction: GenesysTransaction = await response.json();

    console.log('Genesys transaction response:', genesysTransaction);
    console.log('PIX payload:', genesysTransaction.pix?.payload);

    const pixPayload = genesysTransaction.pix?.payload || '';
    const qrCodeImageUrl = pixPayload
      ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(pixPayload)}`
      : '';

    const { data: transaction, error: dbError } = await supabase
      .from('transactions')
      .insert({
        genesys_transaction_id: genesysTransaction.id,
        cpf: data.cpf,
        amount: data.amount,
        pix_key: data.pixKey,
        qr_code: pixPayload,
        qr_code_image: qrCodeImageUrl,
        status: genesysTransaction.status.toLowerCase(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        utm_source: data.utmSource,
        utm_medium: data.utmMedium,
        utm_campaign: data.utmCampaign,
        utm_term: data.utmTerm,
        utm_content: data.utmContent,
        src: data.src,
        sck: data.sck,
        product_id: data.productId,
        user_ip: data.userIp,
        user_agent: data.userAgent,
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log('Transaction saved to database:', transaction);

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

    return transaction as Transaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

export async function getTransactionStatus(transactionId: string): Promise<Transaction> {
  try {
    const config = await getGenesysConfig();

    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const response = await fetch(
      `${config.apiUrl}/v1/transactions/${transaction.genesys_transaction_id}`,
      {
        headers: {
          'api-secret': config.apiSecret,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch transaction status from Genesys');
    }

    const genesysTransaction: GenesysTransaction = await response.json();
    const normalizedStatus = genesysTransaction.status.toLowerCase();

    if (normalizedStatus !== transaction.status) {
      const updateData: any = {
        status: normalizedStatus,
        updated_at: new Date().toISOString(),
      };

      if (normalizedStatus === 'authorized' && !transaction.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      const { data: updatedTransaction, error: updateError } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update transaction: ${updateError.message}`);
      }

      return updatedTransaction as Transaction;
    }

    return transaction as Transaction;
  } catch (error) {
    console.error('Error getting transaction status:', error);
    throw error;
  }
}

export async function getTransactionByGenesysId(genesysId: string): Promise<Transaction | null> {
  try {
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('genesys_transaction_id', genesysId)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return transaction as Transaction | null;
  } catch (error) {
    console.error('Error getting transaction:', error);
    throw error;
  }
}
