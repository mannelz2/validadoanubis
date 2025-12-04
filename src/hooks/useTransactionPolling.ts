import { useEffect, useState, useRef } from 'react';
import { getTransactionStatus } from '../services/pixService';
import type { Transaction } from '../services/genesysApi';

interface UseTransactionPollingOptions {
  transactionId: string | null;
  enabled?: boolean;
  interval?: number;
  onStatusChange?: (transaction: Transaction) => void;
}

export function useTransactionPolling({
  transactionId,
  enabled = true,
  interval = 5000,
  onStatusChange,
}: UseTransactionPollingOptions) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (!transactionId || !enabled) {
      setLoading(false);
      return;
    }

    const pollStatus = async () => {
      try {
        const updatedTransaction = await getTransactionStatus(transactionId);
        setTransaction(updatedTransaction);
        setError(null);
        setLoading(false);

        if (
          previousStatusRef.current &&
          previousStatusRef.current !== updatedTransaction.status &&
          onStatusChange
        ) {
          onStatusChange(updatedTransaction);
        }

        previousStatusRef.current = updatedTransaction.status;

        if (updatedTransaction.status === 'completed' || updatedTransaction.status === 'authorized' || updatedTransaction.status === 'approved' || updatedTransaction.status === 'failed') {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (err: any) {
        console.error('Error polling transaction status:', err);
        setError(err.message || 'Erro ao verificar status do pagamento');
        setLoading(false);
      }
    };

    pollStatus();

    intervalRef.current = setInterval(pollStatus, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [transactionId, enabled, interval, onStatusChange]);

  return { transaction, loading, error };
}
