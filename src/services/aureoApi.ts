import { createClient } from '@supabase/supabase-js';
import type { CreateTransactionRequest, Transaction } from './genesysApi';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface AureoConfig {
  apiUrl: string;
  publicKey: string;
  secretKey: string;
}

export async function createAureoTransaction(
  config: AureoConfig,
  data: CreateTransactionRequest
): Promise<Transaction> {
  try {
    console.log('Creating Aureo transaction with amount:', data.amount);
    console.log('Aureo config:', {
      apiUrl: config.apiUrl,
      hasPublicKey: !!config.publicKey,
      publicKeyPrefix: config.publicKey?.substring(0, 10),
      hasSecretKey: !!config.secretKey,
      secretKeyPrefix: config.secretKey?.substring(0, 10),
    });

    const auth = 'Basic ' + btoa(config.publicKey + ':' + config.secretKey);

    const objectId = Date.now().toString();
    const amountInCents = Math.round(data.amount * 100);

    const payload = {
      type: 'transaction',
      objectId: objectId,
      companyId: 1,
      amount: amountInCents,
      currency: 'BRL',
      paymentMethod: 'pix',
      status: 'waiting_payment',
      installments: 1,
      postbackUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aureo-webhook`,
      ip: '127.0.0.1',
      externalRef: `pix_${objectId}`,
      items: [
        {
          title: data.productName || 'Produto Digital',
          quantity: 1,
          tangible: false,
          unitPrice: amountInCents,
          externalRef: `item_${objectId}`,
        },
      ],
      customer: {
        name: data.customerName || 'Cliente',
        email: data.customerEmail || 'cliente@example.com',
        phone: data.customerPhone || '11999999999',
        birthdate: data.customerBirthdate || '1990-01-01',
        document: {
          type: 'cpf',
          number: data.cpf,
        },
        ...(data.utmSource && { utm_source: data.utmSource }),
        ...(data.utmMedium && { utm_medium: data.utmMedium }),
        ...(data.utmCampaign && { utm_campaign: data.utmCampaign }),
        ...(data.utmTerm && { utm_term: data.utmTerm }),
        ...(data.utmContent && { utm_content: data.utmContent }),
        ...(data.src && { src: data.src }),
        address: data.customerAddress ? {
          street: data.customerAddress.street || 'Rua Principal',
          streetNumber: data.customerAddress.number || '100',
          complement: data.customerAddress.complement || '',
          zipCode: data.customerAddress.zipcode || '01000000',
          neighborhood: data.customerAddress.neighborhood || 'Centro',
          city: data.customerAddress.city || 'São Paulo',
          state: data.customerAddress.state || 'SP',
          country: 'BR',
        } : {
          street: 'Rua Principal',
          streetNumber: '100',
          complement: '',
          zipCode: '01000000',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          country: 'BR',
        },
      },
    };

    console.log('Aureo API URL:', `${config.apiUrl}/v1/transactions`);
    console.log('Aureo payload:', JSON.stringify(payload, null, 2));
    console.log('Aureo auth header:', auth.substring(0, 20) + '...');

    const response = await fetch(`${config.apiUrl}/v1/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Aureo Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Aureo API error:', errorText);
      throw new Error(`Aureo API error: ${response.status} - ${errorText}`);
    }

    const aureoTransaction = await response.json();
    console.log('Aureo transaction created:', aureoTransaction);

    const transactionId = crypto.randomUUID();

    const pixData = aureoTransaction.data?.pix || aureoTransaction.pix;
    const qrCodeText = pixData?.qrcode || pixData?.qrCode || pixData?.qrCodeText || pixData?.copyPaste || '';

    let qrCodeImage = '';
    if (qrCodeText) {
      try {
        qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeText)}`;
      } catch (e) {
        console.error('Error generating QR code URL:', e);
      }
    }

    const transaction: Transaction = {
      id: transactionId,
      amount: data.amount,
      status: 'pending',
      qr_code: qrCodeText,
      qr_code_image: qrCodeImage,
      cpf: data.cpf,
      genesys_transaction_id: (aureoTransaction.data?.id || aureoTransaction.id || transactionId).toString(),
      provider: 'aureo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
    console.error('Error creating Aureo transaction:', error);
    throw error;
  }
}

export async function getAureoTransactionStatus(
  config: AureoConfig,
  transactionId: string
): Promise<string> {
  try {
    console.log('Checking Aureo transaction status:', transactionId);

    const auth = 'Basic ' + btoa(config.publicKey + ':' + config.secretKey);

    const response = await fetch(`${config.apiUrl}/v1/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Aureo status check error:', errorText);
      throw new Error(`Aureo API error: ${response.status} - ${errorText}`);
    }

    const transaction = await response.json();
    console.log('Aureo transaction status:', transaction);

    const status = transaction.status || transaction.payment?.status || 'pending';

    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'paid': 'approved',
      'authorized': 'approved',
      'approved': 'approved',
      'cancelled': 'cancelled',
      'failed': 'failed',
      'expired': 'cancelled',
    };

    return statusMap[status.toLowerCase()] || 'pending';
  } catch (error: any) {
    console.error('Error checking Aureo transaction status:', error);
    throw error;
  }
}
