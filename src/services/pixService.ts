import { createClient } from '@supabase/supabase-js';
import { createTransaction as createGenesysTransaction, getTransactionStatus as getGenesysTransactionStatus, type CreateTransactionRequest, type Transaction } from './genesysApi';
import { createMangofyTransaction, getMangofyTransactionStatus, type MangofyConfig } from './mangofyApi';
import { createAureoTransaction, getAureoTransactionStatus, type AureoConfig } from './aureoApi';
import { createBestfyTransaction, getBestfyTransactionStatus, type BestfyConfig } from './bestfyApi';
import { createBabylonTransaction, getBabylonTransactionStatus, type BabylonConfig } from './babylonApi';
import { getNextProductName } from '../utils/productNameRotation';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export { supabase };

export interface PixProviderSettings {
  id: string;
  provider: 'genesys' | 'mangofy' | 'aureo' | 'bestfy' | 'babylon';
  api_url: string;
  api_key: string;
  store_code?: string;
  public_key?: string;
  secret_key?: string;
  company_id?: string;
  is_active: boolean;
}

async function checkForDuplicateTransaction(cpf: string, amount: number): Promise<Transaction | null> {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('customer_cpf', cpf)
    .eq('amount', amount)
    .in('status', ['pending', 'authorized', 'approved'])
    .gte('created_at', thirtyMinutesAgo)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error checking for duplicate transaction:', error);
    return null;
  }

  if (data) {
    console.log('Found existing transaction:', data.id);
    return data as Transaction;
  }

  return null;
}

async function getActiveProvider(): Promise<PixProviderSettings> {
  const { data, error } = await supabase
    .from('pix_provider_settings')
    .select('*')
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get active provider: ${error.message}`);
  }

  if (!data) {
    throw new Error('No active PIX provider configured');
  }

  return data as PixProviderSettings;
}

export async function createTransaction(data: CreateTransactionRequest, options?: { createReceipt?: boolean }): Promise<Transaction> {
  const cpfClean = data.cpf.replace(/\D/g, '');

  const existingTransaction = await checkForDuplicateTransaction(cpfClean, data.amount);
  if (existingTransaction) {
    console.log('Reusing existing transaction instead of creating duplicate');
    return existingTransaction;
  }

  const provider = await getActiveProvider();

  console.log('Using PIX provider:', provider.provider);

  const productName = await getNextProductName();
  console.log('✓ Product name for transaction:', productName);

  const transactionData = {
    ...data,
    productName: productName,
    createReceipt: options?.createReceipt !== false,
  };

  if (provider.provider === 'babylon') {
    if (!provider.secret_key || !provider.company_id) {
      throw new Error('Babylon keys not configured');
    }

    const babylonConfig: BabylonConfig = {
      apiUrl: provider.api_url,
      secretKey: provider.secret_key,
      companyId: provider.company_id,
    };

    return createBabylonTransaction(babylonConfig, transactionData);
  } else if (provider.provider === 'bestfy') {
    if (!provider.public_key || !provider.secret_key) {
      throw new Error('Bestfy keys not configured');
    }

    const bestfyConfig: BestfyConfig = {
      apiUrl: provider.api_url,
      publicKey: provider.public_key,
      secretKey: provider.secret_key,
    };

    return createBestfyTransaction(bestfyConfig, transactionData);
  } else if (provider.provider === 'aureo') {
    if (!provider.public_key || !provider.secret_key) {
      throw new Error('Aureo keys not configured');
    }

    const aureoConfig: AureoConfig = {
      apiUrl: provider.api_url,
      publicKey: provider.public_key,
      secretKey: provider.secret_key,
    };

    return createAureoTransaction(aureoConfig, transactionData);
  } else if (provider.provider === 'mangofy') {
    if (!provider.store_code) {
      throw new Error('Mangofy store code not configured');
    }

    const mangofyConfig: MangofyConfig = {
      apiUrl: provider.api_url,
      apiKey: provider.api_key,
      storeCode: provider.store_code,
    };

    return createMangofyTransaction(mangofyConfig, transactionData);
  } else {
    return createGenesysTransaction(transactionData);
  }
}

export async function getTransactionStatus(transactionId: string): Promise<Transaction> {
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

  const provider = await getActiveProvider();

  let newStatus: string;

  if (provider.provider === 'babylon') {
    if (!provider.secret_key || !provider.company_id) {
      throw new Error('Babylon keys not configured');
    }

    const babylonConfig: BabylonConfig = {
      apiUrl: provider.api_url,
      secretKey: provider.secret_key,
      companyId: provider.company_id,
    };

    newStatus = await getBabylonTransactionStatus(
      babylonConfig,
      transaction.genesys_transaction_id
    );
  } else if (provider.provider === 'bestfy') {
    if (!provider.public_key || !provider.secret_key) {
      throw new Error('Bestfy keys not configured');
    }

    const bestfyConfig: BestfyConfig = {
      apiUrl: provider.api_url,
      publicKey: provider.public_key,
      secretKey: provider.secret_key,
    };

    newStatus = await getBestfyTransactionStatus(
      bestfyConfig,
      transaction.genesys_transaction_id
    );
  } else if (provider.provider === 'aureo') {
    if (!provider.public_key || !provider.secret_key) {
      throw new Error('Aureo keys not configured');
    }

    const aureoConfig: AureoConfig = {
      apiUrl: provider.api_url,
      publicKey: provider.public_key,
      secretKey: provider.secret_key,
    };

    newStatus = await getAureoTransactionStatus(
      aureoConfig,
      transaction.genesys_transaction_id
    );
  } else if (provider.provider === 'mangofy') {
    if (!provider.store_code) {
      throw new Error('Mangofy store code not configured');
    }

    const mangofyConfig: MangofyConfig = {
      apiUrl: provider.api_url,
      apiKey: provider.api_key,
      storeCode: provider.store_code,
    };

    newStatus = await getMangofyTransactionStatus(
      mangofyConfig,
      transaction.genesys_transaction_id
    );
  } else {
    const updatedTransaction = await getGenesysTransactionStatus(transactionId);
    return updatedTransaction;
  }

  const normalizedStatus = newStatus.toLowerCase();

  if (normalizedStatus !== transaction.status) {
    const updateData: any = {
      status: normalizedStatus,
      updated_at: new Date().toISOString(),
    };

    if ((normalizedStatus === 'authorized' || normalizedStatus === 'approved') && !transaction.completed_at) {
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
}
